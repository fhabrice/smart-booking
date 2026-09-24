#!/usr/bin/env node
/**
 * Smart Booking RDC 🇨🇩 — Installation de la base sur un projet Supabase
 * ---------------------------------------------------------------------------
 * Applique le schéma et le catalogue initial sur un VRAI projet Supabase, sans
 * passer par le SQL Editor : la connexion se fait en direct à PostgreSQL avec
 * la chaîne de connexion du projet.
 *
 * Usage :
 *   SUPABASE_DB_URL="postgresql://postgres:motdepasse@db.<ref>.supabase.co:5432/postgres" \
 *     npm run db:setup
 *
 *   npm run db:setup -- --check     vérification seule (aucune écriture)
 *   npm run db:setup -- --no-seed   schéma uniquement, sans catalogue
 *   npm run db:setup -- --reseed    recharge le catalogue même s'il existe
 *
 * Chaîne de connexion : Supabase → Project Settings → Database →
 *   • « Connection string » → **Session pooler** (recommandé : IPv4, fonctionne
 *     partout) → postgresql://postgres.<ref>:<MOTDEPASSE>@aws-0-<region>.pooler.supabase.com:5432/postgres
 *   • ou « Direct connection » → postgresql://postgres:<MOTDEPASSE>@db.<ref>.supabase.co:5432/postgres
 *     (⚠️ IPv6 uniquement — injoignable depuis certains réseaux)
 *
 * Le mot de passe de la base n'est PAS la clé service_role : il se définit dans
 * Project Settings → Database → Reset database password.
 *
 * Le script est idempotent : il peut être relancé sans réinstaller.
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import pg from "pg"

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, "..")

const args = process.argv.slice(2)
const CHECK_ONLY = args.includes("--check")
const NO_SEED = args.includes("--no-seed")
const RESEED = args.includes("--reseed")

const DB_URL = (process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL ?? "").trim()

if (!DB_URL) {
  console.error(
    "❌ Chaîne de connexion manquante.\n\n" +
      "   Définissez SUPABASE_DB_URL (Supabase → Project Settings → Database → Connection string),\n" +
      "   de préférence en mode « Session pooler » :\n\n" +
      '   SUPABASE_DB_URL="postgresql://postgres.<ref>:<MOTDEPASSE>@aws-0-<region>.pooler.supabase.com:5432/postgres" \\\n' +
      "     npm run db:setup\n",
  )
  process.exit(1)
}

if (!/^postgres(ql)?:\/\//.test(DB_URL)) {
  console.error("❌ La chaîne de connexion doit commencer par postgresql:// ou postgres://")
  process.exit(1)
}

// Supabase impose TLS. `sslmode=disable` reste possible pour un PostgreSQL local.
const sslDisabled = /[?&]sslmode=disable/.test(DB_URL)
const client = new pg.Client({
  connectionString: DB_URL.replace(/[?&]sslmode=[a-z-]+/g, ""),
  ssl: sslDisabled ? undefined : { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

const fail = (msg) => {
  console.error(`\n❌ ${msg}\n`)
  process.exit(1)
}

const read = (file) => readFileSync(join(ROOT, file), "utf8")

// ---------------------------------------------------------------------------
//  Motif d'affichage
// ---------------------------------------------------------------------------

let ok = 0
let ko = 0
const check = (label, good, detail = "") => {
  if (good) {
    ok++
    console.log(`  ✅ ${label}${detail ? ` — ${detail}` : ""}`)
  } else {
    ko++
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`)
  }
  return good
}

// ---------------------------------------------------------------------------
//  0. Connexion
// ---------------------------------------------------------------------------

console.log("🔗 Connexion à la base Supabase…")
try {
  await client.connect()
} catch (err) {
  const hint = /ENOTFOUND|EAI_AGAIN|ETIMEDOUT|ECONNREFUSED|EHOSTUNREACH/.test(String(err.code ?? ""))
    ? "\n   → Hôte injoignable. Si vous utilisez la « Direct connection » (db.<ref>.supabase.co),\n" +
      "     elle est IPv6 uniquement : essayez plutôt la chaîne « Session pooler »."
    : /password|authentication/i.test(String(err.message))
      ? "\n   → Mot de passe refusé. Il se réinitialise dans Project Settings → Database →\n" +
        "     Reset database password (ce n'est PAS la clé service_role)."
      : ""
  fail(`Connexion impossible : ${err.message}${hint}`)
}

const { rows: who } = await client.query(
  "select current_database() as db, current_user as usr, version() as v",
)
console.log(`✔ Connecté — base « ${who[0].db} », utilisateur « ${who[0].usr} »`)
console.log(`  ${who[0].v.split(",")[0]}`)

const q = async (sql, params) => (await client.query(sql, params)).rows
const one = async (sql, params) => (await q(sql, params))[0]

// ---------------------------------------------------------------------------
//  1. État actuel
// ---------------------------------------------------------------------------

const installed = await one(
  "select to_regclass('public.providers') is not null as providers, to_regclass('public.services') is not null as services",
)
const serviceCount = installed.services
  ? Number((await one("select count(*)::int as n from public.services")).n)
  : 0

console.log(
  installed.providers && installed.services
    ? `\n📊 Schéma déjà présent (${serviceCount} prestation(s) en base).`
    : "\n📊 Base vierge — le schéma sera installé.",
)

// ---------------------------------------------------------------------------
//  2. Installation (sauf --check)
// ---------------------------------------------------------------------------

if (CHECK_ONLY) {
  console.log("\n🔎 Mode --check : aucune modification ne sera appliquée.")
} else {
  const steps = [["supabase-schema.sql", "Schéma (tables, vues, RLS, référentiels)"]]
  if (!NO_SEED && (RESEED || serviceCount === 0)) {
    steps.push(["seed-catalog.sql", "Catalogue initial (6 prestataires + 20 prestations)"])
  } else if (!NO_SEED) {
    console.log("⏭️  Catalogue déjà chargé — conserve tel quel (utilisez --reseed pour le recharger).")
  }
  steps.push(["migration-paiement-direct.sql", "Migration paiement direct (idempotente)"])

  for (const [file, label] of steps) {
    process.stdout.write(`\n🗄️  ${label}… `)
    const t0 = Date.now()
    try {
      await client.query(read(file))
      console.log(`OK (${Date.now() - t0} ms)`)
    } catch (err) {
      console.log("ÉCHEC")
      console.error(`\n❌ ${file} : ${err.message}`)
      if (err.position) {
        const upto = read(file).slice(0, Number(err.position))
        const line = upto.split("\n").length
        console.error(`   ligne ${line} du fichier`)
        console.error(`   ${read(file).split("\n")[line - 1]?.trim().slice(0, 120)}`)
      }
      const msg = String(err.message)
      let hint
      if (/"auth"/.test(msg) || /\bauth\./.test(msg)) {
        hint =
          "\n   → Cette base n'est pas un projet Supabase : le schéma `auth` (fourni par Supabase)\n" +
          "     est absent. `db:setup` s'adresse à un projet Supabase (supabase.com).\n" +
          "     Pour développer en local, utilisez plutôt :  npm run dev:local"
      } else if (/extension|permission denied|must be owner/i.test(msg)) {
        hint =
          "\n   → Privilèges insuffisants : les extensions (pgcrypto, unaccent) et les politiques RLS\n" +
          "     exigent un utilisateur propriétaire de la base. Sur Supabase, utilisez bien la chaîne\n" +
          "     de connexion du rôle `postgres` (Project Settings → Database → Connection string)."
      } else if (/already exists/i.test(msg)) {
        hint =
          "\n   → Objet déjà présent : le script est idempotent, relancez simplement `npm run db:setup`."
      } else {
        hint =
          "\n   → Vérifiez la chaîne de connexion (Session pooler recommandé) et relancez.\n" +
          "     Le script étant idempotent, aucun objet déjà créé ne sera perdu."
      }
      console.error(hint + "\n")
      await client.end()
      process.exit(1)
    }
  }
}

// ---------------------------------------------------------------------------
//  3. Vérification
// ---------------------------------------------------------------------------

console.log("\n════════════ VÉRIFICATION DE LA BASE ════════════\n")

const tables = await q(
  `select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE' order by 1`,
)
const names = tables.map((t) => t.table_name)
const expected = [
  "activity_log", "bookings", "cart_items", "categories", "ceremony_events", "cities",
  "event_types", "messages", "payout_requests", "platform_accounts", "providers",
  "quotes", "reviews", "services",
]
const missing = expected.filter((t) => !names.includes(t))
check("Tables attendues", missing.length === 0, missing.length ? `manquantes : ${missing.join(", ")}` : `${names.length} tables`)

const view = await one("select to_regclass('public.services_public') is not null as ok")
check("Vue services_public", view.ok === true)

const rls = await one(
  `select count(*)::int as total,
          count(*) filter (where c.relrowsecurity)::int as active
     from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'`,
)
check("Sécurité RLS active", rls.active === rls.total, `${rls.active}/${rls.total} tables protégées`)

const pol = await one("select count(*)::int as n from pg_policies where schemaname = 'public'")
check("Politiques RLS", pol.n > 0, `${pol.n} politiques`)

// Types énumérés : les valeurs doivent correspondre à celles envoyées par l'app.
const enums = await q(
  `select t.typname as name, array_agg(e.enumlabel::text order by e.enumsortorder) as labels
     from pg_type t join pg_enum e on e.enumtypid = t.oid
    where t.typname in ('payment_method', 'booking_status', 'provider_status',
                        'admin_approval_status', 'payout_status', 'chat_role')
    group by t.typname`,
)
const enumMap = new Map(enums.map((e) => [e.name, e.labels]))
const payLabels = enumMap.get("payment_method") ?? []
check(
  "Opérateurs Mobile Money",
  ["M-Pesa", "Orange Money", "Airtel Money"].every((m) => payLabels.includes(m)),
  payLabels.join(" · ") || "type absent",
)

// Référentiels
const refs = await one(
  `select (select count(*)::int from public.categories)   as categories,
          (select count(*)::int from public.cities)       as cities,
          (select count(*)::int from public.event_types)  as event_types`,
)
check("Référentiels (catégories / villes / cérémonies)", refs.categories >= 12 && refs.cities >= 10 && refs.event_types >= 8, `${refs.categories} / ${refs.cities} / ${refs.event_types}`)

// Colonnes de paiement direct sur bookings
const payCols = await q(
  `select column_name from information_schema.columns
    where table_schema = 'public' and table_name = 'bookings'
      and column_name in ('provider_payout_method', 'provider_payout_number',
                          'commission_rate', 'platform_fee', 'provider_net')`,
)
check("Colonnes de paiement direct (bookings)", payCols.length === 5, `${payCols.length}/5 colonnes`)

// Comptes de collecte internes
const accounts = await one("select count(*)::int as n from public.platform_accounts")
check("Comptes de collecte internes", accounts.n >= 1, `${accounts.n} compte(s)`)

// Aucune réservation existante sans répartition
const unreconciled = await one(
  "select count(*)::int as n from public.bookings where deposit > 0 and platform_fee = 0 and provider_net = 0",
)
check("Répartition des paiements à jour", unreconciled.n === 0, `${unreconciled.n} réservation(s) à reprendre`)

// Catalogue
const catalogue = await one(
  `select (select count(*)::int from public.providers) as providers,
          (select count(*)::int from public.services
            where admin_approval_status = 'approved' and is_deleted = false) as services`,
)
check("Catalogue en vitrine", catalogue.services > 0 || CHECK_ONLY, `${catalogue.providers} prestataire(s), ${catalogue.services} prestation(s) approuvée(s)`)

// Rattachement prestations → comptes prestataires
if (catalogue.services > 0) {
  const link = await one(
    "select count(*)::int as total, count(provider_id)::int as linked from public.services",
  )
  const orphans = link.total - link.linked
  if (orphans === 0) {
    check("Rattachement des prestations", true, `${link.linked}/${link.total} liées à un compte`)
  } else {
    console.log(
      `  ⚠️  Rattachement des prestations — ${link.linked}/${link.total} liées à un compte prestataire.\n` +
        `      ${orphans} prestation(s) du catalogue sont rattachées à aucune fiche : elles s'affichent\n` +
        "      correctement en vitrine (nom commercial), mais n'apparaissent dans l'espace d'aucun\n" +
        "      prestataire connecté et ne sont pas concernées par une suspension de compte.\n" +
        "      → Visible côté admin (/admin/services) ; rattachez-les depuis l'espace prestataire.",
    )
  }
}

await client.end()

console.log(`\n─────────────────────────────────────────────────`)
console.log(`  ${ok} contrôle(s) réussi(s), ${ko} échec(s)`)
console.log(`─────────────────────────────────────────────────\n`)

if (ko > 0) {
  console.error("❌ La base n'est pas prête : corrigez les points ci-dessus.\n")
  process.exit(1)
}

console.log("✅ Base prête pour Smart Booking RDC.\n")
console.log("Étape suivante — renseignez ces variables dans Netlify (Site settings → Environment variables) :")
console.log("   SUPABASE_URL                 = https://<ref>.supabase.co")
console.log("   SUPABASE_SERVICE_ROLE_KEY    = <clé service_role — Project Settings → API>")
console.log("   ADMIN_ACCESS_CODE            = <code fort, jamais admin243 en production>")
console.log("   NEXT_PUBLIC_USD_TO_FC_RATE   = 2850   (facultatif)\n")
console.log("Puis vérifiez le branchement applicatif :  npm run db:check\n")
