#!/usr/bin/env node
/**
 * Smart Booking RDC 🇨🇩 — Vérification du branchement de la base
 * ---------------------------------------------------------------------------
 * Contrôle que la base est bien câblée POUR L'APPLICATION : ce script interroge
 * l'API REST Supabase exactement comme le font les Route Handlers `/api/*`
 * (mêmes requêtes, mêmes filtres, mêmes relations), avec la clé service_role.
 *
 * Usage :
 *   SUPABASE_URL="https://<ref>.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="<clé service_role>" \
 *     npm run db:check
 *
 * Sortie non nulle si un contrôle échoue → utilisable avant un déploiement.
 */
const URL_BASE = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/$/, "")
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()

if (!URL_BASE || !KEY) {
  console.error(
    "❌ Variables manquantes : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.\n\n" +
      "   SUPABASE_SERVICE_ROLE_KEY = Supabase → Project Settings → API keys.\n" +
      "   Accepte la clé secrète récente (sb_secret_…) ou l'ancienne clé service_role (JWT).\n" +
      "   Elle reste côté serveur : ne la préfixez jamais NEXT_PUBLIC_ et ne la publiez pas.\n",
  )
  process.exit(1)
}

// ---------------------------------------------------------------------------
//  Contrôle du type de clé — la confusion la plus fréquente du dashboard
// ---------------------------------------------------------------------------

function keyDiagnostic(key) {
  if (key.startsWith("sb_publishable_")) {
    return {
      ok: false,
      label: "clé publique (publishable)",
      advice:
        "C'est la clé PUBLIQUE (anciennement anon) : elle ne peut pas écrire et les\n" +
        "     politiques RLS la limitent à la lecture. L'application a besoin de la clé\n" +
        "     SECRÈTE : Project Settings → API keys → Secret keys (sb_secret_…).",
    }
  }
  if (key.startsWith("sb_secret_")) {
    return { ok: true, label: "clé secrète (format récent)", advice: "" }
  }
  if (key.startsWith("eyJ")) {
    try {
      const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"))
      if (payload.role === "service_role") {
        return { ok: true, label: "clé legacy service_role (JWT)", advice: "" }
      }
      if (payload.role === "anon") {
        return {
          ok: false,
          label: "clé legacy anon (JWT)",
          advice:
            "Cette clé est PUBLIQUE : elle ne peut pas écrire. Utilisez la clé service_role\n" +
            "     (API keys → Legacy API keys) ou la clé secrète récente (sb_secret_…).",
        }
      }
      return { ok: false, label: `JWT de rôle « ${payload.role ?? "inconnu"} »`, advice: "Rôle inattendu : utilisez la clé service_role." }
    } catch {
      return { ok: false, label: "JWT illisible", advice: "La clé semble tronquée : recopiez-la en entier." }
    }
  }
  return {
    ok: false,
    label: "format de clé inconnu",
    advice: "Utilisez la clé secrète (sb_secret_…) ou la clé legacy service_role du dashboard.",
  }
}

const keyInfo = keyDiagnostic(KEY)
if (keyInfo.ok) {
  console.log(`🔑 Clé fournie : ${keyInfo.label}\n`)
} else {
  console.error(
    `❌ Clé refusée avant même de contacter la base : ${keyInfo.label}.\n\n` +
      `   → ${keyInfo.advice}\n`,
  )
  process.exit(1)
}

let ok = 0
let ko = 0
let warn = 0
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
const note = (label, detail) => {
  warn++
  console.log(`  ⚠️  ${label} — ${detail}`)
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
}

async function rest(path, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  })
  const text = await res.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  return { status: res.status, body }
}

console.log(`🔗 ${URL_BASE}\n`)
console.log("════════════ BRANCHEMENT DE LA BASE ════════════\n")

// ---------------------------------------------------------------------------
//  1. Joignabilité et authentification
// ---------------------------------------------------------------------------

let reachable = true
try {
  const ping = await rest("providers?select=id&limit=1")
  if (ping.status === 401 || ping.status === 403) {
    reachable = false
    check("Clé service_role acceptée", false, `API REST a refusé la clé (HTTP ${ping.status})`)
    console.error(
      "\n   → La clé est invalide ou n'est pas la clé service_role.\n" +
        "     Vérifiez Project Settings → API → service_role (et non anon / publishable).\n",
    )
  } else if (ping.status === 404) {
    reachable = false
    check("Table `providers` accessible", false, "schéma non installé → exécutez `npm run db:setup`")
  } else if (ping.status >= 400) {
    reachable = false
    check("API REST joignable", false, `HTTP ${ping.status} — ${JSON.stringify(ping.body).slice(0, 160)}`)
  } else {
    check("API REST joignable et clé service_role acceptée", true, `HTTP ${ping.status}`)
    check("Schéma installé (table `providers`)", true)
  }
} catch (err) {
  reachable = false
  check("API REST joignable", false, err.message)
  console.error(
    `\n   → Impossible de joindre ${URL_BASE}/rest/v1.\n` +
      "     Vérifiez l'URL du projet (Project Settings → API → Project URL) et l'accès réseau.\n",
  )
}

if (!reachable) {
  console.log(`\n  ${ok} réussi(s), ${ko} échec(s) — vérification interrompue.\n`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
//  2. Vitrine publique (requête identique à dbListPublicServices)
// ---------------------------------------------------------------------------

const vitrine = await rest(
  "services?select=*&admin_approval_status=eq.approved&is_deleted=eq.false&paused=eq.false&order=created_at.desc",
)
if (check("Vitrine client (prestations approuvées)", vitrine.status === 200 && Array.isArray(vitrine.body), `HTTP ${vitrine.status}`)) {
  const list = vitrine.body
  if (list.length === 0) {
    note("Aucune prestation en vitrine", "le catalogue est vide — chargez `seed-catalog.sql` (npm run db:setup)")
  } else {
    const first = list[0]
    const mapped = ["id", "name", "category", "price", "city", "provider_name", "admin_approval_status"].every(
      (k) => first[k] !== undefined,
    )
    check("Champs lus par l'application", mapped, `${list.length} prestation(s) — ex. « ${first.name} »`)
    check(
      "Nom du prestataire présent sur chaque prestation",
      list.every((s) => String(s.provider_name ?? "").trim().length > 0),
      "affiché sur les fiches de la vitrine",
    )
  }
}

// ---------------------------------------------------------------------------
//  3. Prestataires
// ---------------------------------------------------------------------------

const providers = await rest("providers?select=id,name,status&order=registered_at.desc")
if (check("Comptes prestataires", providers.status === 200 && Array.isArray(providers.body), `HTTP ${providers.status}`)) {
  const approved = providers.body.filter((p) => p.status === "approved").length
  check("Comptes approuvés", approved > 0 || providers.body.length === 0, `${approved} approuvé(s) sur ${providers.body.length}`)
}

// ---------------------------------------------------------------------------
//  4. Colonnes de paiement direct (routage Mobile Money)
// ---------------------------------------------------------------------------

const payCols = await rest(
  "bookings?select=provider_payout_method,provider_payout_number,platform_fee,provider_net&limit=1",
)
check(
  "Colonnes de paiement direct (bookings)",
  payCols.status === 200,
  payCols.status === 200 ? "routage des acomptes opérationnel" : "exécutez `npm run db:setup` (migration)",
)

// ---------------------------------------------------------------------------
//  5. Relations embarquées (panier → prestations)
// ---------------------------------------------------------------------------

const join = await rest("cart_items?select=*,services(*)&limit=1")
check(
  "Relations entre tables résolues",
  join.status === 200,
  join.status === 200 ? "jointure panier → prestations OK" : `HTTP ${join.status} — ${JSON.stringify(join.body).slice(0, 140)}`,
)

// ---------------------------------------------------------------------------
//  6. Tables réservées au serveur
// ---------------------------------------------------------------------------

const accounts = await rest("platform_accounts?select=label&is_active=eq.true")
check("Comptes de collecte internes (rôle service)", accounts.status === 200, accounts.status === 200 ? `${accounts.body.length} compte(s) actif(s)` : `HTTP ${accounts.status}`)

const refs = await Promise.all([
  rest("categories?select=id"),
  rest("cities?select=id"),
  rest("event_types?select=id"),
])
check(
  "Référentiels (catégories, villes, cérémonies)",
  refs.every((r) => r.status === 200),
  `${refs[0].body?.length ?? 0} / ${refs[1].body?.length ?? 0} / ${refs[2].body?.length ?? 0}`,
)

// ---------------------------------------------------------------------------
//  7. Écriture réelle (création puis suppression d'une ligne de journal)
// ---------------------------------------------------------------------------

let writeOk = false
try {
  const ins = await rest("activity_log", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      type: "booking_created",
      title: "Vérification du branchement (npm run db:check)",
      description: "Ligne de contrôle créée puis supprimée automatiquement.",
      actor_role: "client",
    }),
  })
  if (ins.status === 201 && Array.isArray(ins.body) && ins.body[0]?.id) {
    writeOk = true
    await rest(`activity_log?id=eq.${encodeURIComponent(ins.body[0].id)}`, { method: "DELETE" })
  } else {
    check("Écriture en base autorisée", false, `HTTP ${ins.status} — ${JSON.stringify(ins.body).slice(0, 160)}`)
    console.error(
      "\n   → La clé ne peut pas écrire : vérifiez qu'il s'agit bien de la clé service_role\n" +
        "     (la clé anon / publishable ne suffit pas — les écritures sont réservées au serveur).\n",
    )
  }
} catch (err) {
  check("Écriture en base autorisée", false, err.message)
}
if (writeOk) check("Écriture en base autorisée (ligne de contrôle créée puis supprimée)", true)

// ---------------------------------------------------------------------------
//  8. Rattachement des prestations aux comptes
// ---------------------------------------------------------------------------

const served = await rest("services?select=provider_id,provider_name&limit=1000")
if (served.status === 200 && Array.isArray(served.body) && served.body.length > 0) {
  const linked = served.body.filter((s) => s.provider_id).length
  const total = served.body.length
  if (linked === total) {
    check("Rattachement prestations → comptes prestataires", true, `${linked}/${total}`)
  } else {
    note(
      "Rattachement prestations → comptes prestataires",
      `${linked}/${total} liées — ${total - linked} prestation(s) du catalogue ne dépendent d'aucune fiche.\n` +
        "      Elles s'affichent correctement en vitrine (nom commercial) mais n'apparaissent dans\n" +
        "      l'espace d'aucun prestataire connecté. Visibles côté admin (/admin/services).",
    )
  }
}

// ---------------------------------------------------------------------------
//  9. Variables d'environnement de l'application
// ---------------------------------------------------------------------------

const adminCode = (process.env.ADMIN_ACCESS_CODE ?? "").trim()
if (!adminCode) {
  note("ADMIN_ACCESS_CODE", "non défini pour cette vérification — en production il est obligatoire,\nsinon l'espace /admin accepte le code public « admin243 » du dépôt")
} else if (adminCode === "admin243") {
  note("ADMIN_ACCESS_CODE", "valeur de secours publique — choisissez un code fort avant la mise en ligne")
} else {
  check("ADMIN_ACCESS_CODE défini", true, "code personnalisé")
}

const rate = (process.env.NEXT_PUBLIC_USD_TO_FC_RATE ?? "").trim()
check("Taux USD → FC", true, rate ? `${rate} FC` : "défaut 2850 FC")

// ---------------------------------------------------------------------------

console.log("\n─────────────────────────────────────────────────")
console.log(`  ${ok} contrôle(s) réussi(s), ${ko} échec(s)` + (warn ? `, ${warn} avertissement(s)` : ""))
console.log("─────────────────────────────────────────────────\n")

if (ko > 0) {
  console.error("❌ Le branchement n'est pas complet — corrigez les points ci-dessus.\n")
  process.exit(1)
}
console.log("✅ Base correctement branchée : l'application peut lire et écrire.\n")
