#!/usr/bin/env node
/**
 * Smart Booking RDC 🇨🇩 — Environnement de développement 100 % local
 * ---------------------------------------------------------------------------
 * `npm run dev:local` lance d'un seul coup :
 *
 *   1. un PostgreSQL EMBARQUÉ réel (PostgreSQL 18 via `embedded-postgres`,
 *      données persistées dans .pgdata/) sur le port 54322 ;
 *   2. l'installation automatique du schéma `supabase-schema.sql` puis du
 *      catalogue initial réel `seed-catalog.sql` (première exécution) ;
 *   3. un serveur REST local compatible PostgREST/Supabase
 *      (scripts/local-rest-server.mjs) sur le port 54321 ;
 *   4. `next dev -H 0.0.0.0 -p 3000` avec SUPABASE_URL pointant sur ce
 *      serveur REST local.
 *
 * → Le site lit TOUTES ses données dans une vraie base PostgreSQL, sans
 *   toucher au réseau : idéal pour développer hors ligne ou dans un bac à
 *   sable sans accès à *.supabase.co. Aucune modification du code applicatif.
 *
 * ⚠️  Mode DÉVELOPPEMENT uniquement (clé non vérifiée, serveurs en local).
 *     En production : créer un vrai projet Supabase et définir
 *     SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (voir .env.example).
 *
 * Options :
 *   --reset   supprime .pgdata/ (réinstalle schéma + catalogue au démarrage)
 *   --db-only démarre PostgreSQL + REST sans `next dev` (pour `npm run dev`
 *             séparé avec .env.local pointant sur http://127.0.0.1:54321)
 *
 * Variables (surchargeables) :
 *   LOCAL_PG_PORT (54322), LOCAL_REST_PORT (54321), APP_PORT (3000),
 *   APP_HOST (0.0.0.0), ADMIN_ACCESS_CODE (admin243 par défaut)
 */
import { spawn } from "node:child_process"
import fs from "node:fs"
import net from "node:net"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")

const args = process.argv.slice(2)
const RESET = args.includes("--reset")
const DB_ONLY = args.includes("--db-only")

const PG_PORT = Number(process.env.LOCAL_PG_PORT ?? 54322)
const REST_PORT = Number(process.env.LOCAL_REST_PORT ?? 54321)
const APP_PORT = Number(process.env.APP_PORT ?? 3000)
const APP_HOST = process.env.APP_HOST ?? "0.0.0.0"
const PG_USER = "postgres"
const PG_PASSWORD = "postgres"
const DATA_DIR = path.join(ROOT, ".pgdata")

/** Clé service_role factice, acceptée uniquement par le serveur REST local. */
const LOCAL_SERVICE_KEY = "local-dev-service-role-key"

// ---------------------------------------------------------------------------
//  0. Préambule
// ---------------------------------------------------------------------------

if (!fs.existsSync(path.join(ROOT, "node_modules", "embedded-postgres"))) {
  console.error("❌ Dépendances manquantes — exécutez d'abord `npm install`.")
  process.exit(1)
}

if (RESET) {
  fs.rmSync(DATA_DIR, { recursive: true, force: true })
  console.log("♻️  .pgdata/ supprimé — la base sera réinstallée.")
}

// ---------------------------------------------------------------------------
//  1. Libérer le port PostgreSQL d'un éventuel postmaster orphelin
// ---------------------------------------------------------------------------

function tcpPortInUse(port, host = "127.0.0.1") {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.once("connect", () => {
      socket.destroy()
      resolve(true)
    })
    socket.once("error", () => resolve(false))
    socket.setTimeout(1000, () => {
      socket.destroy()
      resolve(false)
    })
    socket.connect(port, host)
  })
}

async function killStalePostmaster() {
  if (!(await tcpPortInUse(PG_PORT))) return
  const pidFile = path.join(DATA_DIR, "postmaster.pid")
  if (!fs.existsSync(pidFile)) {
    console.error(
      `❌ Le port ${PG_PORT} est occupé sans base locale identifiable.\n` +
        `   Libérez-le ou définissez LOCAL_PG_PORT.`,
    )
    process.exit(1)
  }
  const [pidRaw, , , dataDir] = fs.readFileSync(pidFile, "utf8").split("\n")
  const pid = Number(pidRaw)
  if (!Number.isFinite(pid) || dataDir !== DATA_DIR) {
    console.error(
      `❌ Le port ${PG_PORT} est occupé par un autre service (postmaster.pid ≠ .pgdata).\n` +
        `   Définissez LOCAL_PG_PORT pour utiliser un autre port.`,
    )
    process.exit(1)
  }
  try {
    process.kill(pid, 0) // vérifie que le processus existe
    console.log(`♻️  Arrêt d'un postmaster orphelin (pid ${pid}) sur le port ${PG_PORT}…`)
    process.kill(pid, "SIGINT") // arrêt rapide propre
  } catch {
    /* le processus a déjà disparu */
  }
  for (let i = 0; i < 100 && (await tcpPortInUse(PG_PORT)); i++) {
    await new Promise((r) => setTimeout(r, 100))
  }
  if (await tcpPortInUse(PG_PORT)) {
    console.error(`❌ Impossible de libérer le port ${PG_PORT}.`)
    process.exit(1)
  }
}

await killStalePostmaster()

// ---------------------------------------------------------------------------
//  2. PostgreSQL embarqué (démarrage / réutilisation de .pgdata)
// ---------------------------------------------------------------------------

const { default: EmbeddedPostgres } = await import("embedded-postgres")

const firstRun = !fs.existsSync(path.join(DATA_DIR, "PG_VERSION"))

const pgdb = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: PG_USER,
  password: PG_PASSWORD,
  port: PG_PORT,
  authMethod: "password",
  persistent: true,
  initdbFlags: ["--encoding=UTF-8", "--locale=C.UTF-8"],
  onLog: () => {}, // initdb/pg verbeux : silencieux sauf erreur ci-dessous
  onError: (msg) => console.error("[pg] ⚠️", msg),
})

try {
  if (firstRun) {
    console.log(`📦 Initialisation de la base locale (${DATA_DIR})…`)
    await pgdb.initialise()
  }
  await pgdb.start()
} catch (err) {
  // Certains systèmes n'exposent pas la locale C.UTF-8 → repli sur la locale C
  if (firstRun && !fs.existsSync(path.join(DATA_DIR, "PG_VERSION"))) {
    console.log("↩️  Réessai avec la locale C…")
    fs.rmSync(DATA_DIR, { recursive: true, force: true })
    const fallback = new EmbeddedPostgres({
      databaseDir: DATA_DIR,
      user: PG_USER,
      password: PG_PASSWORD,
      port: PG_PORT,
      authMethod: "password",
      persistent: true,
      initdbFlags: ["--encoding=UTF-8", "--locale=C"],
      onLog: () => {},
      onError: (msg) => console.error("[pg] ⚠️", msg),
    })
    await fallback.initialise()
    await fallback.start()
  } else {
    console.error("❌ Échec du démarrage de PostgreSQL :", err?.message ?? err)
    process.exit(1)
  }
}
console.log(`✔ PostgreSQL embarqué → 127.0.0.1:${PG_PORT} (données : .pgdata/)`)

// ---------------------------------------------------------------------------
//  3. Installation du schéma + catalogue (première fois / après --reset)
// ---------------------------------------------------------------------------

const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8")

// Adaptateur local : les politiques RLS du schéma référencent auth.role()
// (fonction fournie par Supabase). On crée un stub minimal qui tient le rôle
// service_role — sans effet puisque le serveur REST se connecte en
// superutilisateur (BYPASSRLS), exactement comme la clé service_role Supabase.
const AUTH_STUB = `
create schema if not exists auth;
create or replace function auth.role() returns text language sql stable as $$ select 'service_role'::text $$;
create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
`

// Marqueur local pour ne rejouer le catalogue qu'à l'installation (jamais
// après une suppression volontaire de prestations depuis l'admin).
const MARKER = `
create table if not exists public.local_dev_meta (key text primary key, value text);
`

async function withClient(fn) {
  const client = pgdb.getPgClient()
  await client.connect()
  try {
    return await fn(client)
  } finally {
    await client.end()
  }
}

const installed = await withClient(async (client) => {
  const { rows } = await client.query(
    "select to_regclass('public.providers') is not null as ok, to_regclass('public.services') is not null as services",
  )
  return rows[0]
})

if (!installed.ok) {
  console.log("🗄️  Installation du schéma (supabase-schema.sql)…")
  await withClient(async (client) => {
    await client.query(AUTH_STUB)
    await client.query(read("supabase-schema.sql"))
    await client.query(MARKER)
  })
  console.log("✔ Schéma installé (tables, vues, RLS, données de référence).")
} else if (!installed.services) {
  console.warn("⚠️  Schéma partiel détecté — relancez avec --reset pour réinstaller proprement.")
}

const seeded = await withClient(async (client) => {
  await client.query(MARKER)
  const { rows } = await client.query(
    "select value from public.local_dev_meta where key = 'seed_catalog'",
  )
  return rows[0]?.value === "v1"
})

if (!seeded) {
  console.log("🌼 Chargement du catalogue initial réel (seed-catalog.sql)…")
  await withClient(async (client) => {
    await client.query(read("seed-catalog.sql"))
    await client.query(
      "insert into public.local_dev_meta (key, value) values ('seed_catalog', 'v1') on conflict (key) do update set value = 'v1'",
    )
  })
  console.log("✔ Catalogue chargé (6 prestataires partenaires + 20 prestations).")
}

const stats = await withClient(async (client) => {
  const providers = await client.query("select count(*)::int as n from public.providers")
  const services = await client.query(
    "select count(*)::int as n from public.services where admin_approval_status = 'approved' and is_deleted = false",
  )
  return { providers: providers.rows[0].n, services: services.rows[0].n }
})
console.log(
  `📊 Base locale : ${stats.providers} prestataires, ${stats.services} prestations en vitrine.`,
)

// ---------------------------------------------------------------------------
//  4. Serveur REST local compatible PostgREST (port 54321)
// ---------------------------------------------------------------------------

process.env.LOCAL_PG_PORT = String(PG_PORT)
process.env.LOCAL_PG_USER = PG_USER
process.env.LOCAL_PG_PASSWORD = PG_PASSWORD
const { startRestServer } = await import("./local-rest-server.mjs")
const restServer = await startRestServer({ port: REST_PORT, host: "127.0.0.1" })
console.log(`✔ API REST locale → http://127.0.0.1:${REST_PORT}/rest/v1 (mode dev uniquement)`)

// ---------------------------------------------------------------------------
//  4 bis. .env.local — pour que `npm run dev` (lancé séparément) trouve la base
// ---------------------------------------------------------------------------
// Le README documente `npm run db:local` + `npm run dev`. Sans ce fichier,
// `npm run dev` démarre sans base et la vitrine affiche « Base de données
// requise ». On le crée donc au premier lancement, SANS jamais écraser une
// configuration existante (par exemple un vrai projet Supabase).

const ENV_FILE = path.join(ROOT, ".env.local")

if (!fs.existsSync(ENV_FILE)) {
  fs.writeFileSync(
    ENV_FILE,
    `# Généré automatiquement par \`npm run dev:local\` (base PostgreSQL embarquée).\n` +
      `# Pour utiliser un VRAI projet Supabase, remplacez ces deux valeurs\n` +
      `# (voir .env.example) — ce fichier ne sera plus régénéré.\n` +
      `SUPABASE_URL=http://127.0.0.1:${REST_PORT}\n` +
      `SUPABASE_SERVICE_ROLE_KEY=${LOCAL_SERVICE_KEY}\n` +
      `ADMIN_ACCESS_CODE=${process.env.ADMIN_ACCESS_CODE ?? "admin243"}\n` +
      `NEXT_PUBLIC_USD_TO_FC_RATE=${process.env.NEXT_PUBLIC_USD_TO_FC_RATE ?? "2850"}\n`,
    "utf8",
  )
  console.log("✔ .env.local créé (base locale) — il n'écrasera aucune configuration existante.")
}

if (DB_ONLY) {
  console.log("\n🟢 Base locale prête. Lancez `npm run dev` dans un autre terminal.")
  console.log(`   (SUPABASE_URL=http://127.0.0.1:${REST_PORT} est lu depuis .env.local)\n`)
} else {
  // -------------------------------------------------------------------------
  //  5. next dev (application)
  // -------------------------------------------------------------------------

  const nextBin = path.join(ROOT, "node_modules", ".bin", "next")
  if (!fs.existsSync(nextBin)) {
    console.error("❌ `next` introuvable — exécutez d'abord `npm install`.")
    process.exit(1)
  }

  const appEnv = {
    ...process.env,
    SUPABASE_URL: `http://127.0.0.1:${REST_PORT}`,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? LOCAL_SERVICE_KEY,
    ADMIN_ACCESS_CODE: process.env.ADMIN_ACCESS_CODE ?? "admin243",
    NEXT_PUBLIC_USD_TO_FC_RATE: process.env.NEXT_PUBLIC_USD_TO_FC_RATE ?? "2850",
  }

  console.log(`🚀 next dev → http://${APP_HOST}:${APP_PORT}\n`)
  const app = spawn(nextBin, ["dev", "-H", APP_HOST, "-p", String(APP_PORT)], {
    cwd: ROOT,
    env: appEnv,
    stdio: ["inherit", "inherit", "inherit"],
  })

  app.on("exit", (code, signal) => {
    if (shuttingDown) return
    console.log(`\n⛔ next dev arrêté (${signal ?? `code ${code}`}) — arrêt de la base locale…`)
    shuttingDown = true
    restServer.close()
    pgdb.stop().finally(() => process.exit(code ?? 0))
  })
}

// ---------------------------------------------------------------------------
//  6. Arrêt propre (Ctrl+C, signaux)
// ---------------------------------------------------------------------------

let shuttingDown = false
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (shuttingDown) return
    shuttingDown = true
    console.log(`\n👋 Arrêt (${signal}) — fermeture de la base locale…`)
    restServer.close()
    pgdb
      .stop()
      .catch(() => {})
      .finally(() => process.exit(0))
  })
}

// Garde-fou : jamais idle si la base tourne (embedded-postgres gère l'arrêt)
setInterval(() => {}, 1 << 30)
