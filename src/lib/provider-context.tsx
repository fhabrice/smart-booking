"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { ProviderProfileData, Service, ServiceOverride } from "./types"
import { services as catalogServices } from "./data"

const SESSION_KEY = "sb-rdc-provider-session"
const OVERRIDES_KEY = "sb-rdc-provider-overrides"
const CUSTOM_SERVICES_KEY = "sb-rdc-custom-services"
const PROVIDER_PROFILES_KEY = "sb-rdc-provider-profiles"

type ProviderSpaceContextType = {
  mounted: boolean
  /** Nom du prestataire connecté (null = déconnecté) */
  session: string | null
  login: (providerName: string) => void
  logout: () => void
  /** Modifs par prestation : prix, pause, réservation instantanée */
  overrides: Record<string, ServiceOverride>
  setOverride: (serviceId: string, patch: Partial<ServiceOverride>) => void
  /** Prestations créées depuis l'espace prestataires */
  customServices: Service[]
  addCustomService: (service: Omit<Service, "id">) => Service
  removeCustomService: (id: string) => void
  /** Profils éditables (coordonnées + retraits) */
  profiles: Record<string, ProviderProfileData>
  updateProfile: (providerName: string, patch: Partial<ProviderProfileData>) => void
}

const ProviderSpaceContext = createContext<ProviderSpaceContextType | undefined>(undefined)

function applyOverride(service: Service, override?: ServiceOverride): Service {
  if (!override) return service
  return {
    ...service,
    price: override.price ?? service.price,
    instant: override.instant ?? service.instant,
    paused: override.paused ?? service.paused,
  }
}

export function ProviderSpaceProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(null)
  const [overrides, setOverrides] = useState<Record<string, ServiceOverride>>({})
  const [customServices, setCustomServices] = useState<Service[]>([])
  const [profiles, setProfiles] = useState<Record<string, ProviderProfileData>>({})
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedSession) setSession(savedSession)
      const savedOverrides = localStorage.getItem(OVERRIDES_KEY)
      if (savedOverrides) setOverrides(JSON.parse(savedOverrides))
      const savedCustom = localStorage.getItem(CUSTOM_SERVICES_KEY)
      if (savedCustom) setCustomServices(JSON.parse(savedCustom))
      const savedProfiles = localStorage.getItem(PROVIDER_PROFILES_KEY)
      if (savedProfiles) setProfiles(JSON.parse(savedProfiles))
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      if (session) localStorage.setItem(SESSION_KEY, session)
      else localStorage.removeItem(SESSION_KEY)
    }
  }, [session, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
  }, [overrides, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem(CUSTOM_SERVICES_KEY, JSON.stringify(customServices))
  }, [customServices, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem(PROVIDER_PROFILES_KEY, JSON.stringify(profiles))
  }, [profiles, mounted])

  const login = (providerName: string) => setSession(providerName)
  const logout = () => setSession(null)

  const setOverride = (serviceId: string, patch: Partial<ServiceOverride>) => {
    setOverrides((prev) => ({ ...prev, [serviceId]: { ...prev[serviceId], ...patch } }))
  }

  const addCustomService = (data: Omit<Service, "id">) => {
    const newService: Service = { ...data, id: `custom-${Math.random().toString(36).slice(2, 9)}` }
    setCustomServices((prev) => [newService, ...prev])
    return newService
  }

  const removeCustomService = (id: string) => {
    setCustomServices((prev) => prev.filter((s) => s.id !== id))
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const updateProfile = (providerName: string, patch: Partial<ProviderProfileData>) => {
    setProfiles((prev) => ({ ...prev, [providerName]: { ...prev[providerName], ...patch } }))
  }

  return (
    <ProviderSpaceContext.Provider
      value={{
        mounted,
        session,
        login,
        logout,
        overrides,
        setOverride,
        customServices,
        addCustomService,
        removeCustomService,
        profiles,
        updateProfile,
      }}
    >
      {children}
    </ProviderSpaceContext.Provider>
  )
}

export function useProviderSpace() {
  const ctx = useContext(ProviderSpaceContext)
  if (!ctx) throw new Error("useProviderSpace must be used within ProviderSpaceProvider")
  return ctx
}

/** Catalogue complet = services du code + prestations créées par les prestataires, overrides appliqués */
export function useMergedServices(): Service[] {
  const { overrides, customServices } = useProviderSpace()
  return useMemo(
    () => [...catalogServices, ...customServices].map((s) => applyOverride(s, overrides[s.id])),
    [overrides, customServices]
  )
}

/** Prestations d'un prestataire donné (catalogue + créées), overrides appliqués */
export function useProviderServices(providerName: string): Service[] {
  const merged = useMergedServices()
  return useMemo(() => merged.filter((s) => s.provider.name === providerName), [merged, providerName])
}

/** Profil d'un prestataire : coordonnées saisies dans l'espace prestataires */
export function useProviderProfile(providerName: string | null): ProviderProfileData {
  const { profiles } = useProviderSpace()
  return (providerName && profiles[providerName]) || {}
}
