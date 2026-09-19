import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Intégration Supabase — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * Le schéma SQL complet se trouve à la racine du dépôt : `supabase-schema.sql`
 * (à exécuter dans Supabase Studio → SQL Editor).
 *
 * L'application fonctionne en deux modes :
 *  1. **Mode Supabase**  — lorsque NEXT_PUBLIC_SUPABASE_URL et
 *     NEXT_PUBLIC_SUPABASE_ANON_KEY sont définis (Netlify, production).
 *  2. **Mode local**     — sinon, `isSupabaseConfigured` vaut `false` et les
 *     contextes React conservent leur persistance `localStorage` actuelle.
 *     Aucun crash, aucun écran blanc : le site reste 100 % utilisable.
 *
 * ⚠️ La clé `service_role` ne doit jamais être exposée au navigateur :
 *    elle n'est lue que côté serveur (Route Handlers, Server Actions).
 */

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim()
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim()
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim()

/** true quand le projet Supabase est configuré (variables présentes et valides). */
export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0 && /^https?:\/\//.test(supabaseUrl)

let browserClient: SupabaseClient | null = null

/**
 * Client Supabase "anon" — utilisable côté navigateur.
 * Les politiques RLS du schéma limitent la lecture au catalogue approuvé.
 * Retourne `null` si Supabase n'est pas configuré.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 5 } },
    })
  }
  return browserClient
}

/**
 * Client Supabase "service_role" — **uniquement côté serveur**.
 * Contourne les RLS : réservé aux Route Handlers et tâches d'administration.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured || !supabaseServiceKey) return null
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() ne doit jamais être appelé dans le navigateur.")
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** URL du projet Supabase (pour affichage / débogage). */
export function getSupabaseUrl(): string {
  return supabaseUrl
}
