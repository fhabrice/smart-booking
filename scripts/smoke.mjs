#!/usr/bin/env node
/**
 * Smart Booking RDC 🇨🇩 — Test de fumée d'une instance
 * ---------------------------------------------------------------------------
 * Vérifie qu'une instance de l'application fonctionne réellement, en appelant
 * ses Route Handlers `/api/*` et ses pages comme le ferait un navigateur.
 *
 *   npm run smoke                          # instance locale (localhost:3000)
 *   npm run smoke -- --url https://exemple.netlify.app
 *   npm run smoke -- --url … --write       # exécute aussi les écritures
 *
 * Deux modes :
 *   • par défaut — LECTURE SEULE : sûr à lancer sur la production. Contrôle la
 *     vitrine, les comptes, les référentiels et le refus des accès admin.
 *   • `--write`   — parcours complet (réservation, inscription, publication,
 *     modération, retrait, renommage). ⚠️ CRÉE DE VRAIES DONNÉES : à réserver
 *     à une base de test ou de développement.
 *
 * Code de sortie : 0 si tout passe, 1 sinon (utilisable en CI ou après un
 * déploiement).
 */

const args = process.argv.slice(2)
const urlArg = args.includes("--url") ? args[args.indexOf("--url") + 1] : null
const BASE = (urlArg ?? process.env.SMOKE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const WRITE = args.includes("--write")

let pass = 0
let fail = 0

const ok = (label, good, detail = "") => {
  if (good) {
    pass++
    console.log(`  ✅ ${label}${detail ? ` — ${detail}` : ""}`)
  } else {
    fail++
    console.log(`  ❌ ${label}${detail ? ` — ${detail}` : ""}`)
  }
}

async function req(path, init) {
  let res
  try {
    res = await fetch(`${BASE}${path}`, { ...init, redirect: "manual" })
  } catch (err) {
    return { status: 0, json: null, error: err.message }
  }
  return { status: res.status, json: await res.json().catch(() => null), res }
}
const send = (method) => (path, body, cookie) =>
  req(path, {
    method,
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: JSON.stringify(body),
  })
const post = send("POST")
const patch = send("PATCH")
const put = send("PUT")

const adminCookie = async (code) => {
  const res = await fetch(`${BASE}/api/admin/auth`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code }),
  })
  if (res.status !== 200) return null
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ")
}

console.log(`🧪 Test de fumée — ${BASE}`)
console.log(`   mode : ${WRITE ? "écriture (crée des données de test)" : "lecture seule"}\n`)

// ---------------------------------------------------------------------------
//  1. Pages
// ---------------------------------------------------------------------------

console.log("── PAGES ──")
for (const p of ["/", "/cart", "/bookings", "/provider", "/admin", "/events/new"]) {
  const res = await fetch(`${BASE}${p}`, { redirect: "manual" }).catch(() => null)
  ok(`Page ${p}`, res?.status === 200, `HTTP ${res?.status ?? "injoignable"}`)
}

// ---------------------------------------------------------------------------
//  2. Vitrine et catalogue
// ---------------------------------------------------------------------------

console.log("\n── CATALOGUE ──")
const services = await req("/api/services")
const catalogue = services.json?.data ?? []
ok("API vitrine répond", services.status === 200, `HTTP ${services.status}`)

if (services.status === 503) {
  console.log(
    "\n   ⚠️  La base n'est pas configurée sur cette instance (HTTP 503).\n" +
      "       Définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY, puis relancez.",
  )
} else if (services.status === 200) {
  ok("Catalogue non vide", catalogue.length > 0, `${catalogue.length} prestation(s)`)
  ok(
    "Nom du prestataire présent sur chaque prestation",
    catalogue.every((s) => String(s.provider?.name ?? "").trim().length > 0),
    "affichage des fiches",
  )
  ok(
    "Champs requis par l'interface",
    catalogue.every((s) => ["id", "name", "category", "price", "city"].every((k) => s[k] !== undefined)),
    "contrat de données respecté",
  )
  const priceOk = catalogue.every((s) => Number(s.price) > 0)
  ok("Tarifs renseignés", priceOk, priceOk ? "toutes les prestations" : "des prestations sont à 0 USD")

  const providers = await req("/api/providers")
  ok("API prestataires répond", providers.status === 200, `${providers.json?.data?.length ?? 0} comptes`)

  // Note : l'API publique n'expose pas `provider_id`, le rattachement des
  // prestations à un compte ne peut donc pas être vérifié ici. Utilisez
  // `npm run db:check` (accès direct à la base) pour ce contrôle.

  const refs = await req("/api/services?scope=all")
  ok(
    "Accès admin refusé sans session",
    refs.status === 401,
    refs.status === 401 ? "modération protégée" : `HTTP ${refs.status} — ⚠️ accès non protégé`,
  )
}

// ---------------------------------------------------------------------------
//  3. Écritures (optionnel)
// ---------------------------------------------------------------------------

if (WRITE) {
  const stamp = Date.now()
  console.log("\n── ÉCRITURES CLIENT ──")
  const booking = await post("/api/bookings", {
    serviceId: catalogue[0]?.id ?? "salle-kin",
    serviceName: catalogue[0]?.name ?? "Prestation de test",
    providerName: catalogue[0]?.provider?.name ?? "Prestataire de test",
    date: "2027-03-01",
    time: "15:00",
    price: 500,
    deposit: 250,
    paymentMethod: "M-Pesa",
    customerName: `Test fumée ${stamp}`,
    customerPhone: "+243900000099",
    city: "Goma",
  })
  ok("Réservation client", booking.status === 201, booking.json?.error ?? "")

  const cart = await put("/api/cart", {
    session: `smoke-${stamp}`,
    items: catalogue.slice(0, 2).map((s) => ({ serviceId: s.id, date: "2027-03-01", time: "15:00" })),
  })
  ok(
    "Panier multi-prestations (jointures)",
    cart.status === 200 && cart.json?.data?.every((i) => i.service?.name),
    `${cart.json?.data?.length ?? 0} article(s) résolu(s)`,
  )

  const quote = await post("/api/quotes", {
    sessionId: `smoke-${stamp}`,
    quoteNumber: `DEV-SMOKE-${stamp}`,
    date: "2026-09-24",
    validUntil: "2026-10-24",
    customerName: `Test fumée ${stamp}`,
    customerPhone: "+243900000099",
    items: [
      {
        id: "l1",
        serviceId: catalogue[0]?.id ?? "salle-kin",
        date: "2027-03-01",
        time: "15:00",
        service: {
          id: catalogue[0]?.id ?? "salle-kin",
          name: catalogue[0]?.name ?? "Prestation",
          price: 500,
          priceUnit: "la prestation",
          provider: { name: catalogue[0]?.provider?.name ?? "Prestataire" },
        },
      },
    ],
    subtotal: 500,
    discount: 0,
    total: 500,
    deposit: 250,
    balance: 250,
  })
  ok("Devis pro-forma", quote.status === 201, quote.json?.error ?? "")

  console.log("\n── ESPACE PRESTATAIRE ──")
  const name = `Prestataire Test Fumée ${stamp}`
  const provider = await post("/api/providers", {
    name,
    contactPerson: "Test fumée",
    phone: "+243900000099",
    city: "Goma",
    category: "traiteurs",
    payoutMethod: "M-Pesa",
    payoutNumber: "+243900000099",
  })
  ok("Inscription prestataire", provider.status === 201, provider.json?.error ?? "")

  const service = await post("/api/services", {
    providerId: provider.json?.data?.id,
    provider: { name },
    name: `Prestation test fumée ${stamp}`,
    category: "traiteurs",
    description: "Créée par `npm run smoke --write`.",
    price: 200,
    city: "Goma",
  })
  ok("Publication d'une prestation (→ modération)", service.status === 201, service.json?.error ?? "")

  const payout = await post("/api/payouts", {
    providerName: name,
    amountUSD: 50,
    method: "M-Pesa",
    phoneNumber: "+243900000099",
  })
  ok("Demande de retrait", payout.status === 201, payout.json?.error ?? "")

  console.log("\n── MESSAGERIE ──")
  const thread = `cp-${name}-+243900000099`
  const msg = await post("/api/messages", {
    threadId: thread,
    fromRole: "client",
    fromName: "Client test fumée",
    toRole: "provider",
    toName: name,
    content: "Message de test.",
  })
  ok("Envoi client → prestataire", msg.status === 201, msg.json?.error ?? "")
  ok("Message émis par l'admin sans session → refusé", (await post("/api/messages", {
    threadId: thread,
    fromRole: "admin",
    fromName: "Admin",
    toRole: "provider",
    toName: name,
    content: "non autorisé",
  })).status === 401)

  console.log("\n── MODÉRATION ADMIN ──")
  const cookie = await adminCookie(process.env.ADMIN_ACCESS_CODE ?? "admin243")
  if (!cookie) {
    ok("Connexion admin", false, "code refusé — définissez ADMIN_ACCESS_CODE")
  } else {
    ok("Connexion admin", true)
    const scopeAll = await req("/api/bookings?scope=all", { headers: { cookie } })
    ok("Réservations globales (admin)", scopeAll.status === 200, `${scopeAll.json?.data?.length ?? 0} réservations`)

    const approved = await patch(
      `/api/services/${service.json?.data?.id}`,
      { adminApprovalStatus: "approved" },
      cookie,
    )
    ok("Approbation d'une prestation", approved.status === 200, approved.json?.error ?? "")

    const published = await req("/api/services")
    ok(
      "Prestation approuvée publiée en vitrine",
      published.json?.data?.some((s) => s.id === service.json?.data?.id),
      "visible côté client",
    )

    console.log("\n── COHÉRENCE APRÈS RENOMMAGE ──")
    const renamed = `Prestataire Test Fumée Renommé ${stamp}`
    const ren = await patch(`/api/providers/${provider.json?.data?.id}`, { name: renamed }, cookie)
    ok("Renommage d'un compte prestataire", ren.status === 200, ren.json?.error ?? "")
    const afterRename = await req(`/api/services?provider=${encodeURIComponent(renamed)}`)
    ok(
      "Catalogue conservé après renommage",
      afterRename.json?.data?.length > 0,
      `${afterRename.json?.data?.length ?? 0} prestation(s)`,
    )
    const payAfter = await req(`/api/payouts?provider=${encodeURIComponent(renamed)}`)
    ok(
      "Retraits conservés après renommage",
      payAfter.json?.data?.length > 0,
      `${payAfter.json?.data?.length ?? 0} demande(s)`,
    )
    const msgAfter = await req(`/api/messages?provider=${encodeURIComponent(renamed)}`)
    ok(
      "Messagerie conservée après renommage",
      msgAfter.json?.data?.length > 0,
      `${msgAfter.json?.data?.length ?? 0} message(s)`,
    )
    const backfill = await req("/api/services")
    console.log(
      `  ℹ️  Vitrine après renommage : « ${backfill.json?.data?.find((s) => s.id === service.json?.data?.id)?.provider?.name ?? "—"} »`,
    )

    await patch(`/api/providers/${provider.json?.data?.id}`, { status: "suspended" }, cookie)
    const suspended = await req("/api/services")
    ok(
      "Suspension retire les prestations de la vitrine",
      !suspended.json?.data?.some((s) => s.id === service.json?.data?.id),
      "mesure de sécurité effective",
    )
  }
}

// ---------------------------------------------------------------------------

console.log("\n═══════════════════════════════════════════════")
console.log(`  ${pass} réussi(s), ${fail} échec(s)`)
console.log("═══════════════════════════════════════════════\n")
if (fail > 0) {
  console.error("❌ Des contrôles ont échoué.\n")
  process.exit(1)
}
console.log(WRITE ? "✅ Instance pleinement fonctionnelle (données de test créées).\n" : "✅ Instance opérationnelle.\n")
