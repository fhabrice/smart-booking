"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"

/**
 * Session administrateur — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * Le code secret n'est **jamais** présent dans le code client : la vérification
 * est faite par la Route Handler `/api/admin/auth` (voir
 * `src/app/api/admin/auth/route.ts`), qui pose un cookie httpOnly signé.
 *
 * Aucun bouton d'accès « démo » ni code par défaut n'est affiché à l'écran.
 */

const AUTH_ENDPOINT = "/api/admin/auth"

type AdminContextType = {
  isAdmin: boolean
  mounted: boolean
  /** Vérifie le code côté serveur. Résout `true` si l'accès est accordé. */
  login: (code: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Restauration de la session depuis le cookie httpOnly (vérifiée côté serveur)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(AUTH_ENDPOINT, { credentials: "same-origin" })
        const data = await res.json()
        if (!cancelled && data?.authenticated) setIsAdmin(true)
      } catch {
        // Hors-ligne / API indisponible : on reste déconnecté.
      } finally {
        if (!cancelled) setMounted(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return false
    try {
      const res = await fetch(AUTH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "login", code: trimmed }),
      })
      const data = await res.json()
      if (res.ok && data?.ok) {
        setIsAdmin(true)
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    setIsAdmin(false)
    try {
      await fetch(AUTH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "logout" }),
      })
    } catch {
      // La déconnexion locale suffit si l'API est injoignable.
    }
  }, [])

  return (
    <AdminContext.Provider value={{ isAdmin, mounted, login, logout }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider")
  return ctx
}
