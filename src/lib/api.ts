"use client"

/**
 * Petit client HTTP pour les routes /api/* — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * Toutes les données proviennent de la base Supabase via les Route Handlers
 * serveur. Ce helper normalise les réponses ({ ok, data } / { ok, error })
 * et lève une Error lisible en cas d'échec.
 */

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, { credentials: "same-origin", ...init })
  } catch {
    throw new Error("Impossible de joindre le serveur. Vérifiez votre connexion.")
  }
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error ?? `Erreur serveur (${res.status}).`)
  }
  return json.data as T
}

function withBody(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, body?: unknown) => request<T>(url, withBody("POST", body ?? {})),
  patch: <T>(url: string, body: unknown) => request<T>(url, withBody("PATCH", body)),
  put: <T>(url: string, body: unknown) => request<T>(url, withBody("PUT", body)),
}
