#!/usr/bin/env node
/**
 * Smart Booking RDC 🇨🇩 — Serveur REST local compatible PostgREST / Supabase
 * ---------------------------------------------------------------------------
 * Expose sur http://127.0.0.1:54321/rest/v1/* le sous-ensemble de l'API
 * PostgREST utilisé par `@supabase/supabase-js` (lecture + écriture via la
 * clé service_role) : sélection avec filtres (eq, neq, gt/gte/lt/lte, like,
 * ilike, in, is), `or=(...)`, tri, limite, insertion, upsert (on_conflict),
 * mise à jour, suppression, relations embarquées (`services(*)`) et en-têtes
 * `Prefer: return=representation` / `count=exact`.
 *
 * ⚠️  Usage DÉVELOPPEMENT LOCAL uniquement : le serveur n'expose volontairement
 *     que l'interface réseau locale (127.0.0.1), ne valide PAS la signature
 *     de la clé (il vérifie seulement sa présence) et se connecte à PostgreSQL
 *     en superutilisateur — exactement comme la clé `service_role` de Supabase
 *     qui contourne la RLS. Ne JAMAIS l'exposer sur un réseau public.
 *
 * Démarré par `npm run dev:local` (scripts/dev-local.mjs), qui lance aussi le
 * PostgreSQL embarqué et `next dev`. Variables :
 *   LOCAL_REST_PORT (défaut 54321) — port d'écoute du serveur REST
 *   LOCAL_PG_PORT   (défaut 54322) — port du PostgreSQL embarqué
 */
import http from "node:http"
import pg from "pg"

// ---------------------------------------------------------------------------
//  Configuration
// ---------------------------------------------------------------------------

const REST_HOST = process.env.LOCAL_REST_HOST ?? "127.0.0.1"
const REST_PORT = Number(process.env.LOCAL_REST_PORT ?? 54321)
const PG = {
  host: process.env.LOCAL_PG_HOST ?? "127.0.0.1",
  port: Number(process.env.LOCAL_PG_PORT ?? 54322),
  user: process.env.LOCAL_PG_USER ?? "postgres",
  password: process.env.LOCAL_PG_PASSWORD ?? "postgres",
  database: process.env.LOCAL_PG_DATABASE ?? "postgres",
}

// numeric / int8 → nombres JSON (comme PostgREST), pas des chaînes
pg.types.setTypeParser(1700, (v) => (v === null ? null : Number(v)))
pg.types.setTypeParser(20, (v) => (v === null ? null : Number(v)))

const pool = new pg.Pool({ ...PG, max: 10 })

/** pool.query avec journalisation de la requête en cas d'erreur SQL. */
async function q(sql, params) {
  try {
    return await pool.query(sql, params)
  } catch (err) {
    console.error(`[rest] SQL ✗ ${String(sql).slice(0, 300)}`)
    throw err
  }
}

// ---------------------------------------------------------------------------
//  Utilitaires d'analyse des requêtes PostgREST
// ---------------------------------------------------------------------------

const RESERVED_PARAMS = new Set([
  "select",
  "order",
  "limit",
  "offset",
  "on_conflict",
  "and",
  "or",
  "columns",
  "apikey",
  "auth",
])

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/
const OPS = new Set(["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "is", "in"])

/** Découpe une valeur sur un séparateur en respectant guillemets et parenthèses. */
function splitTopLevel(value, sep = ",") {
  const parts = []
  let current = ""
  let depth = 0
  let quoted = false
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]
    if (quoted) {
      current += ch
      if (ch === '"') quoted = false
      continue
    }
    if (ch === '"') {
      quoted = true
      current += ch
      continue
    }
    if (ch === "(") depth++
    if (ch === ")") depth--
    if (ch === sep && depth === 0) {
      parts.push(current)
      current = ""
      continue
    }
    current += ch
  }
  if (current !== "") parts.push(current)
  return parts
}

/** Retire les guillemets doubles englobants d'une valeur. */
function unquote(v) {
  const s = String(v).trim()
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1)
  return s
}

/** Traduit une condition « col.op.valeur » en SQL paramétré. */
function buildCondition(cond, params, columns) {
  const dot = cond.indexOf(".")
  if (dot === -1) throw httpError(400, "PGRST100", `Filtre invalide : « ${cond} »`)
  const col = cond.slice(0, dot)
  const rest = cond.slice(dot + 1)
  const opDot = rest.indexOf(".")
  const op = opDot === -1 ? "eq" : rest.slice(0, opDot)
  const raw = opDot === -1 ? rest : rest.slice(opDot + 1)
  if (!IDENT.test(col)) throw httpError(400, "PGRST100", `Colonne invalide : « ${col} »`)
  if (!columns.has(col)) {
    throw httpError(400, "42703", `Colonne « ${col} » inconnue dans la table.`)
  }
  const qcol = `"${col}"`
  switch (op) {
    case "eq":
    case "neq":
    case "gt":
    case "gte":
    case "lt":
    case "lte": {
      const sqlOp = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=" }[op]
      params.push(raw)
      return `${qcol} ${sqlOp} $${params.length}`
    }
    case "like":
    case "ilike": {
      params.push(raw)
      return `${qcol} ${op === "like" ? "LIKE" : "ILIKE"} $${params.length}`
    }
    case "is": {
      const v = raw.trim().toLowerCase()
      if (v === "null") return `${qcol} IS NULL`
      if (v === "true" || v === "false") {
        params.push(v)
        return `${qcol} = $${params.length}`
      }
      throw httpError(400, "PGRST100", `Valeur « is » non supportée : ${raw}`)
    }
    case "in": {
      const inner = raw.trim().replace(/^\(/, "").replace(/\)$/, "")
      if (inner === "") return "false"
      const values = splitTopLevel(inner).map(unquote)
      const placeholders = values.map((v) => {
        params.push(v)
        return `$${params.length}`
      })
      return `${qcol} IN (${placeholders.join(", ")})`
    }
    default:
      throw httpError(400, "PGRST100", `Opérateur non supporté : « ${op} »`)
  }
}

/** Construit la clause WHERE complète à partir des paramètres de requête. */
function buildWhere(searchParams, columns) {
  const params = []
  const conds = []
  for (const [key, value] of searchParams.entries()) {
    if (RESERVED_PARAMS.has(key)) continue
    const parts = key.split(".")
    if (parts.length > 1 && (parts[0] === "or" || parts[0] === "and")) {
      // forme « or=(a.eq.1,b.eq.2) » ou « or=a.eq.1,b.eq.2 »
      const joiner = parts[0] === "or" ? " OR " : " AND "
      const inner = value.replace(/^\(/, "").replace(/\)$/, "")
      const subs = splitTopLevel(inner)
        .map((c) => buildCondition(c, params, columns))
        .filter(Boolean)
      if (subs.length) conds.push(`(${subs.join(joiner)})`)
      continue
    }
    // forme standard « col=op.valeur » (ou « col=valeur »)
    const eq = value.indexOf(".")
    const maybeOp = eq === -1 ? "" : value.slice(0, eq)
    if (OPS.has(maybeOp)) {
      conds.push(buildCondition(`${key}.${value}`, params, columns))
    } else {
      conds.push(buildCondition(`${key}.eq.${value}`, params, columns))
    }
  }
  return { whereSql: conds.length ? ` where ${conds.join(" and ")}` : "", params }
}

// ---------------------------------------------------------------------------
//  Introspection du schéma (colonnes + relations) — mise en cache
// ---------------------------------------------------------------------------

const metaCache = new Map()

async function tableMeta(table) {
  if (!IDENT.test(table)) throw httpError(404, "42P01", `Table inconnue : ${table}`)
  if (metaCache.has(table)) return metaCache.get(table)
  const cols = await q(
    `select column_name, data_type from information_schema.columns
      where table_schema = 'public' and table_name = $1`,
    [table],
  )
  if (cols.rowCount === 0) {
    throw httpError(404, "42P01", `Table inconnue : ${table} (schéma non installé ?)`)
  }
  const fks = await q(
    `select kcu.column_name as column, ccu.table_name as ref_table, ccu.column_name as ref_column
       from information_schema.table_constraints tc
       join information_schema.key_column_usage kcu
         on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
       join information_schema.constraint_column_usage ccu
         on tc.constraint_name = ccu.constraint_name and tc.table_schema = ccu.table_schema
      where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public'
        and tc.table_name = $1`,
    [table],
  )
  const meta = {
    columns: new Map(cols.rows.map((r) => [r.column_name, r.data_type])),
    fks: fks.rows,
  }
  metaCache.set(table, meta)
  return meta
}

function invalidateMetaCache() {
  metaCache.clear()
}

// ---------------------------------------------------------------------------
//  Réponses / erreurs au format PostgREST
// ---------------------------------------------------------------------------

class HttpError extends Error {
  constructor(status, code, message, details = null, hint = null) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
    this.hint = hint
  }
}

function httpError(status, code, message, details = null, hint = null) {
  return new HttpError(status, code, message, details, hint)
}

/** Mappe une erreur PostgreSQL en réponse PostgREST (le code est conservé). */
function pgErrorToHttp(err) {
  const status = err.code === "23505" || err.code === "23503" ? 409 : 400
  return httpError(status, err.code ?? "XX000", err.message, err.detail ?? null, err.hint ?? null)
}

/** Reconnaît une erreur native de node-postgres (SQLSTATE à 5 caractères). */
function isPgError(err) {
  return (
    err instanceof Error &&
    typeof err.code === "string" &&
    /^[0-9A-Z]{5}$/.test(err.code) &&
    typeof err.severity === "string"
  )
}

function sendError(res, err) {
  const httpErr = err instanceof HttpError ? err : isPgError(err) ? pgErrorToHttp(err) : err
  const status = httpErr instanceof HttpError ? httpErr.status : 500
  const body = {
    code: httpErr.code ?? "500",
    message: httpErr.message,
    details: httpErr.details ?? null,
    hint: httpErr.hint ?? null,
  }
  if (status >= 500) console.error("[rest] erreur interne :", err)
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" })
  res.end(JSON.stringify(body))
}

function wantsObject(req) {
  return String(req.headers.accept ?? "").includes("application/vnd.pgrst.object+json")
}

/** Envoie les lignes en respectant l'en-tête Accept « object » de PostgREST. */
function sendRows(req, res, rows, extraHeaders = {}) {
  const headers = { "content-type": "application/json; charset=utf-8", ...extraHeaders }
  if (wantsObject(req)) {
    if (rows.length === 1) {
      res.writeHead(200, headers)
      res.end(JSON.stringify(rows[0]))
    } else if (rows.length === 0) {
      // postgrest-js .maybeSingle() traduit [] en null côté client
      res.writeHead(200, headers)
      res.end("[]")
    } else {
      res.writeHead(406, headers)
      res.end(
        JSON.stringify({
          code: "PGRST116",
          message: "JSON object requested, multiple (or no) rows returned",
          details: `Results contain ${rows.length} rows, application/vnd.pgrst.object+json requires 1 row`,
          hint: null,
        }),
      )
    }
    return
  }
  res.writeHead(200, headers)
  res.end(JSON.stringify(rows))
}

// ---------------------------------------------------------------------------
//  Sélection : projection + relations embarquées
// ---------------------------------------------------------------------------

/** Analyse « select » : `*`, colonnes simples et relations `rel(*)`. */
function parseSelect(selectParam, columns) {
  const cols = []
  const embeds = []
  for (const part of splitTopLevel(selectParam ?? "*")) {
    const token = part.trim()
    if (token === "" || token === "*") {
      cols.push("*")
      continue
    }
    // relation embarquée : nom(*) — le nom de relation est le nom de table cible
    const m = token.match(/^([A-Za-z_][A-Za-z0-9_]*)\(\*\)$/)
    if (m) {
      embeds.push(m[1])
      continue
    }
    const name = unquote(token)
    if (!IDENT.test(name)) throw httpError(400, "PGRST100", `Champ select invalide : ${token}`)
    if (!columns.has(name)) {
      throw httpError(400, "42703", `Colonne « ${name} » inconnue dans la table.`)
    }
    cols.push(`"${name}"`)
  }
  return { selectSql: (cols.length ? cols : ["*"]).join(", "), embeds }
}

/** Attache les relations embarquées (many-to-one) aux lignes résultats. */
async function attachEmbeds(table, rows, embeds) {
  if (rows.length === 0 || embeds.length === 0) return rows
  for (const rel of embeds) {
    const fk = tableMetaCacheFk(table, rel)
    const ids = [...new Set(rows.map((r) => r[fk.column]).filter((v) => v != null))]
    let map = new Map()
    if (ids.length) {
      const { rows: relRows } = await q(
        `select * from "${rel}" where "${fk.ref_column}" = any($1::text[])`,
        [ids.map(String)],
      )
      map = new Map(relRows.map((r) => [String(r[fk.ref_column]), r]))
    }
    for (const row of rows) row[rel] = row[fk.column] != null ? (map.get(String(row[fk.column])) ?? null) : null
  }
  return rows
}

function tableMetaCacheFk(table, rel) {
  const meta = metaCache.get(table)
  const fk = meta?.fks.find((f) => f.ref_table === rel)
  console.log("[dbg] fk lookup", table, rel, "→", JSON.stringify(fk), "| fks:", JSON.stringify(meta?.fks))
  if (!fk) {
    throw httpError(400, "PGRST200", `Relation « ${rel} » introuvable sur la table « ${table} ».`)
  }
  return fk
}

// ---------------------------------------------------------------------------
//  Génération SQL des écritures (INSERT / UPSERT / UPDATE)
// ---------------------------------------------------------------------------

/** Prépare une valeur JS pour un paramètre SQL selon le type de la colonne. */
function toSqlValue(value, dataType) {
  if (
    value !== null &&
    typeof value === "object" &&
    !(value instanceof Date) &&
    (dataType === "jsonb" || dataType === "json")
  ) {
    return JSON.stringify(value)
  }
  return value
}

function quoteIdent(name) {
  if (!IDENT.test(name)) throw httpError(400, "42703", `Identifiant invalide : ${name}`)
  return `"${name}"`
}

function buildInsert(table, columns, bodyRows, onConflict, returningSql) {
  const allKeys = [...new Set(bodyRows.flatMap((r) => Object.keys(r)))]
  if (allKeys.length === 0) throw httpError(400, "PGRST102", "Corps de requête vide.")
  for (const key of allKeys) {
    if (!columns.has(key)) {
      throw httpError(400, "42703", `Colonne « ${key} » inconnue dans la table « ${table} ».`)
    }
  }
  const params = []
  const tuples = bodyRows.map(
    (row) =>
      `(${allKeys
        .map((key) => {
          const value = row[key] === undefined ? null : toSqlValue(row[key], columns.get(key))
          params.push(value)
          return `$${params.length}`
        })
        .join(", ")})`,
  )
  let conflictSql = ""
  if (onConflict) {
    const conflictCols = onConflict.split(",").map((c) => quoteIdent(c.trim()))
    for (const c of conflictCols) {
      if (!columns.has(c.slice(1, -1))) {
        throw httpError(400, "42703", `Colonne de conflit inconnue : ${c}`)
      }
    }
    const setCols = allKeys.filter((k) => !conflictCols.includes(`"${k}"`))
    conflictSql =
      setCols.length > 0
        ? ` on conflict (${conflictCols.join(", ")}) do update set ${setCols
            .map((k) => `"${k}" = excluded."${k}"`)
            .join(", ")}`
        : " on conflict (" + conflictCols.join(", ") + ") do nothing"
  }
  return {
    sql: `insert into "${table}" (${allKeys.map((k) => `"${k}"`).join(", ")}) values ${tuples.join(", ")}${conflictSql}${returningSql}`,
    params,
  }
}

// ---------------------------------------------------------------------------
//  Gestionnaire HTTP principal
// ---------------------------------------------------------------------------

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const text = Buffer.concat(chunks).toString("utf8")
  if (!text.trim()) return null
  try {
    return JSON.parse(text)
  } catch {
    throw httpError(400, "PGRST102", "Corps JSON invalide.")
  }
}

function parsePrefer(req) {
  const prefer = {}
  for (const part of String(req.headers.prefer ?? "").split(",")) {
    const [k, v] = part.split("=")
    if (k) prefer[k.trim().toLowerCase()] = (v ?? "").trim().toLowerCase()
  }
  return prefer
}

function parseRange(req) {
  const range = String(req.headers.range ?? "")
  const m = range.match(/^(\d+)-(\d*)$/)
  if (!m) return null
  return { offset: Number(m[1]), limit: m[2] === "" ? undefined : Number(m[2]) - Number(m[1]) + 1 }
}

async function handle(req, res) {
  const url = new URL(req.url, "http://localhost")

  // Authentification locale : la clé doit être présente (jamais vérifiée — dev only)
  if (!req.headers.apikey && !req.headers.authorization) {
    throw httpError(401, "PGRST301", "Clé API manquante (en-tête apikey / Authorization).")
  }

  if (!url.pathname.startsWith("/rest/v1/")) {
    throw httpError(404, "404", `Route inconnue : ${url.pathname}`)
  }
  const table = url.pathname.slice("/rest/v1/".length).split("/")[0]
  if (table === "") {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" })
    res.end(JSON.stringify({ ok: true, service: "local-rest (PostgREST dev)", rest: "/rest/v1/<table>" }))
    return
  }

  const meta = await tableMeta(table)
  const search = url.searchParams
  const prefer = parsePrefer(req)

  // ------------------------------------------------------------------ SELECT
  if (req.method === "GET" || req.method === "HEAD") {
    const { whereSql, params } = buildWhere(search, meta.columns)
    const { selectSql, embeds } = parseSelect(search.get("select"), meta.columns)

    let orderSql = ""
    const orderParam = search.get("order")
    if (orderParam) {
      const items = splitTopLevel(orderParam)
        .map((item) => {
          const [col, ...rest] = item.split(".")
          if (!meta.columns.has(col)) {
            throw httpError(400, "42703", `Colonne de tri inconnue : ${col}`)
          }
          const dir = rest[0] === "desc" ? "desc" : "asc"
          return `"${col}" ${dir}`
        })
        .join(", ")
      if (items) orderSql = ` order by ${items}`
    }

    const explicitLimit = search.get("limit")
    const explicitOffset = search.get("offset")
    const range = parseRange(req)
    const limit =
      explicitLimit != null
        ? Number(explicitLimit)
        : range && prefer.count === "exact"
          ? (range.limit ?? 1)
          : range?.limit
    const offset = explicitOffset != null ? Number(explicitOffset) : range?.offset ?? 0

    let sql = `select ${selectSql} from "${table}"${whereSql}${orderSql}`
    if (Number.isFinite(limit) && limit >= 0) sql += ` limit ${Math.trunc(limit)}`
    if (offset > 0) sql += ` offset ${Math.trunc(offset)}`

    const { rows } = await q(sql, params)
    await attachEmbeds(table, rows, embeds)

    const headers = {}
    if (prefer.count === "exact") {
      const { rows: countRows } = await q(
        `select count(*)::int as total from "${table}"${whereSql}`,
        params,
      )
      const total = countRows[0]?.total ?? 0
      const first = offset
      const last = rows.length > 0 ? offset + rows.length - 1 : 0
      headers["content-range"] = total > 0 ? `${first}-${last}/${total}` : `*/0`
    }

    if (req.method === "HEAD") {
      res.writeHead(200, headers)
      res.end()
      return
    }
    sendRows(req, res, rows, headers)
    return
  }

  // ------------------------------------------------------------ INSERT / UPSERT
  if (req.method === "POST") {
    const body = await readBody(req)
    const bodyRows = Array.isArray(body) ? body : [body]
    if (bodyRows.length === 0) throw httpError(400, "PGRST102", "Corps de requête vide.")
    const onConflict = search.get("on_conflict") ?? null
    const representation = prefer.return === "representation" || search.get("select") != null
    const returningSql = representation ? ` returning *` : ""
    const { sql, params } = buildInsert(table, meta.columns, bodyRows, onConflict, returningSql)
    invalidateMetaCache() // le schéma ne change pas, mais par prudence
    const { rows } = await q(sql, params)
    res.writeHead(201, { "content-type": "application/json; charset=utf-8" })
    res.end(representation ? JSON.stringify(wantsObject(req) ? (rows[0] ?? null) : rows) : "")
    return
  }

  // ------------------------------------------------------------------- UPDATE
  if (req.method === "PATCH" || req.method === "PUT") {
    const body = await readBody(req)
    if (typeof body !== "object" || body === null) {
      throw httpError(400, "PGRST102", "Corps JSON objet attendu.")
    }
    const { whereSql, params } = buildWhere(search, meta.columns)
    const sets = []
    for (const [key, value] of Object.entries(body)) {
      if (!meta.columns.has(key)) {
        throw httpError(400, "42703", `Colonne « ${key} » inconnue dans la table « ${table} ».`)
      }
      params.push(toSqlValue(value, meta.columns.get(key)))
      sets.push(`"${key}" = $${params.length}`)
    }
    if (sets.length === 0) throw httpError(400, "PGRST102", "Aucune colonne à mettre à jour.")
    const representation = prefer.return === "representation"
    const sql = `update "${table}" set ${sets.join(", ")}${whereSql}${representation ? " returning *" : ""}`
    const { rows } = await q(sql, params)
    if (representation) {
      sendRows(req, res, rows)
    } else {
      res.writeHead(204)
      res.end()
    }
    return
  }

  // ------------------------------------------------------------------- DELETE
  if (req.method === "DELETE") {
    const { whereSql, params } = buildWhere(search, meta.columns)
    const representation = prefer.return === "representation"
    const sql = `delete from "${table}"${whereSql}${representation ? " returning *" : ""}`
    const { rows } = await q(sql, params)
    if (representation) {
      sendRows(req, res, rows)
    } else {
      res.writeHead(204)
      res.end()
    }
    return
  }

  throw httpError(405, "405", `Méthode ${req.method} non autorisée.`)
}

/**
 * Démarre le serveur REST local. Résout quand le port écoute.
 * Exporté pour être intégré au orchestrateur `scripts/dev-local.mjs`.
 */
export function startRestServer({ port = REST_PORT, host = REST_HOST } = {}) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      handle(req, res).catch((err) => sendError(res, err))
    })
    server.on("error", reject)
    server.listen(port, host, () => {
      console.log(`🗄️  REST local PostgREST → http://${host}:${port}/rest/v1 (dev uniquement)`)
      resolve(server)
    })
  })
}

// Exécution directe : `node scripts/local-rest-server.mjs`
if (process.argv[1] && process.argv[1].endsWith("local-rest-server.mjs")) {
  startRestServer().catch((err) => {
    console.error("❌ Impossible de démarrer le serveur REST local :", err.message)
    process.exit(1)
  })
}
