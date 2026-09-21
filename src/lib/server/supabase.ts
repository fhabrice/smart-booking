import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Client Supabase SERVEUR — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * RÈGLE D'OR : ce module ne doit JAMAIS être importé par un composant client.
 * La clé `service_role` contourne les politiques RLS — elle reste donc
 * exclusivement côté serveur (Route Handlers /api/*).
 *
 * Le navigateur ne reçoit AUCUNE clé : toutes les données (catalogue,
 * réservations, messagerie, retraits…) transitent par /api/* en lecture
 * comme en écriture. Sans variables configurées, les routes répondent 503
 * et l'interface affiche un état vide explicite — jamais de données de démo.
 *
 * Variables d'environnement (voir .env.example) :
 *   SUPABASE_URL                 — ex. https://xxxxxxxxxxxx.supabase.co
 *                                  (NEXT_PUBLIC_SUPABASE_URL accepté en repli)
 *   SUPABASE_SERVICE_ROLE_KEY    — clé secrète "service_role" (serveur only)
 */

const supabaseUrl = (
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  ""
).trim()
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()

/** true quand la base est branchée (URL + clé service_role présentes). */
export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseServiceKey.length > 0 && /^https?:\/\//.test(supabaseUrl)

let adminClient: SupabaseClient | null = null

/**
 * Client Supabase "service_role" — contourne les RLS.
 * Retourne `null` si la base n'est pas configurée (les routes doivent alors
 * répondre 503 via `dbUnavailable()`).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() ne doit jamais être appelé dans le navigateur.")
  }
  if (!isSupabaseConfigured) return null
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return adminClient
}

/** Réponse JSON standard quand la base n'est pas branchée. */
export function dbUnavailable() {
  return {
    ok: false as const,
    error:
      "Base de données non configurée : définissez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY (voir .env.example).",
  }
}
