"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

const ADMIN_SESSION_KEY = "sb-rdc-admin-session"
const ADMIN_DEFAULT_PIN = "admin243"

type AdminContextType = {
  isAdmin: boolean
  mounted: boolean
  login: (code: string) => boolean
  logout: () => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_SESSION_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === "true") setIsAdmin(true)
    } catch {}
    setMounted(true)
  }, [])

  const login = (code: string) => {
    const trimmed = code.trim().toLowerCase()
    if (trimmed === ADMIN_DEFAULT_PIN || trimmed === "admin" || trimmed === "smart2026") {
      setIsAdmin(true)
      localStorage.setItem(ADMIN_SESSION_KEY, "true")
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    localStorage.removeItem(ADMIN_SESSION_KEY)
  }

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
