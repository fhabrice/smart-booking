#!/usr/bin/env node
/**
 * Smart Booking RDC 🇨🇩 — Chargement du catalogue initial dans Supabase (REST)
 * ---------------------------------------------------------------------------
 * Insère (idempotent — upsert sur id) les 6 prestataires partenaires et les
 * 20 prestations du catalogue initial directement via l'API REST PostgREST
 * de Supabase, avec la clé service_role.
 *
 * Usage local :
 *   SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=sb_secret_... \
 *     node scripts/seed-remote.mjs
 *   (ou `npm run seed` avec .env.local déjà rempli)
 *
 * En CI : le workflow .github/workflows/seed-catalog.yml l'exécute avec les
 * secrets du dépôt.
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const here = dirname(fileURLToPath(import.meta.url))
const { providers, services } = JSON.parse(readFileSync(join(here, "seed-data.json"), "utf8"))

const SUPABASE_URL = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\/$/, "")
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()

if (!SUPABASE_URL || !KEY) {
  console.error("❌ Variables manquantes : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requises.")
  process.exit(1)
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
}

async function rest(path, init = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...headers, ...(init.headers ?? {}) } })
  const text = await res.text()
  let body = null
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  return { status: res.status, body, contentRange: res.headers.get("content-range") }
}

async function main() {
  console.log(`🔗 ${SUPABASE_URL}`)

  // -- 0. Vérifier que le schéma existe --------------------------------------
  const probe = await rest("providers?select=id&limit=1")
  if (probe.status !== 200) {
    console.error("❌ Table `providers` introuvable ou schéma non installé :", JSON.stringify(probe.body))
    console.error("   → Exécutez d'abord supabase-schema.sql dans Supabase Studio → SQL Editor.")
    process.exit(1)
  }
  console.log("✔ Schéma présent (table providers accessible).")

  // Vérifie les colonnes de paiement direct sur bookings (migration-paiement-direct.sql)
  const payoutCols = await rest("bookings?select=provider_payout_method,platform_fee,provider_net&limit=1")
  if (payoutCols.status !== 200) {
    console.warn("⚠️ Colonnes de paiement direct absentes sur `bookings` : exécutez migration-paiement-direct.sql")
    console.warn("   (le schéma récent les inclut déjà pour les nouvelles bases).")
  } else {
    console.log("✔ Colonnes de paiement direct présentes (bookings).")
  }

  // -- 1. Upsert des prestataires ---------------------------------------------
  const upProviders = await rest("providers?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(providers),
  })
  if (upProviders.status !== 201 && upProviders.status !== 200) {
    console.error("❌ Échec upsert prestataires :", JSON.stringify(upProviders.body))
    process.exit(1)
  }
  console.log(`✔ ${providers.length} prestataires insérés/mis à jour.`)

  // -- 2. Lier les prestations aux comptes prestataires (nom → id) ------------
  const provRows = await rest("providers?select=id,name")
  const idByName = new Map((provRows.body ?? []).map((p) => [String(p.name).toLowerCase(), p.id]))
  let linked = 0
  const svcWithProvider = services.map((s) => {
    const pid = idByName.get(s.provider_name.toLowerCase())
    if (pid) linked++
    return { ...s, provider_id: pid ?? null }
  })

  // -- 3. Upsert des prestations ----------------------------------------------
  const upServices = await rest("services?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify(svcWithProvider),
  })
  if (upServices.status !== 201 && upServices.status !== 200) {
    console.error("❌ Échec upsert prestations :", JSON.stringify(upServices.body))
    process.exit(1)
  }
  console.log(`✔ ${svcWithProvider.length} prestations insérées/mises à jour (${linked} liées à un compte prestataire).`)

  // -- 4. Vérification finale ---------------------------------------------------
  const countProviders = await rest("providers?select=id&status=eq.approved", { headers: { Prefer: "count=exact", Range: "0-0" } })
  const countServices = await rest("services?select=id&admin_approval_status=eq.approved&is_deleted=eq.false", { headers: { Prefer: "count=exact", Range: "0-0" } })
  const extract = (cr) => (cr?.split("/")[1] ?? "?")
  console.log("")
  console.log("════════════════ RÉSULTAT ════════════════")
  console.log(`  prestataires approuvés : ${extract(countProviders.contentRange)}`)
  console.log(`  prestations en vitrine : ${extract(countServices.contentRange)}`)
  console.log("═══════════════════════════════════════════")
}

main().catch((err) => {
  console.error("❌ Erreur inattendue :", err)
  process.exit(1)
})
