"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import {
  PayoutRequest,
  ProviderAccount,
  ProviderProfileData,
  ProviderStatus,
  Service,
} from "./types"
import { api } from "./api"
import { useAdmin } from "./admin-context"

/**
 * Espace prestataire — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * SOURCE DE VÉRITÉ UNIQUE : la base de données Supabase, atteinte via les
 * routes /api/* (clé service_role conservée côté serveur).
 *
 *   • Aucune donnée de démo, aucun compte pré-chargé, aucune persistance
 *     métier en localStorage — seul le NOM du prestataire connecté est gardé
 *     sur l'appareil (simple session de confort).
 *   • `services` contient le catalogue public approuvé, enrichi des
 *     prestations du prestataire connecté (tous statuts) — ou de TOUTES les
 *     prestations quand l'administrateur est connecté.
 *   • Chaque action est enregistrée en base AVANT mise à jour de l'état
 *     local ; en cas d'erreur, une exception est levée (à afficher dans l'UI).
 */

const SESSION_KEY = "sb-rdc-provider-session"

export type ServicePatchInput = Partial<{
  name: string
  category: string
  description: string
  longDescription: string
  price: number
  priceUnit: string
  duration: number
  image: string
  images: string[]
  city: string
  location: string
  features: string[]
  popular: boolean
  instant: boolean
  paused: boolean
  adminApprovalStatus: "pending" | "approved" | "rejected"
  adminFeedback: string | null
  isDeleted: boolean
}>

type ProviderSpaceContextType = {
  /** true une fois le premier chargement base de données terminé (succès ou échec). */
  mounted: boolean
  /** Message d'erreur si la base est inaccessible / non configurée. */
  dataError: string | null
  session: string | null
  currentAccount: ProviderAccount | null
  login: (providerName: string) => void
  logout: () => void
  accounts: ProviderAccount[]
  registerProvider: (
    data: Omit<ProviderAccount, "id" | "registeredAt" | "rating" | "reviewsCount" | "avatar">
  ) => Promise<ProviderAccount>
  updateAccountStatus: (providerName: string, status: ProviderStatus, adminNotes?: string) => Promise<void>
  updateAccount: (providerName: string, patch: Partial<ProviderAccount>) => Promise<void>
  deleteAccount: (providerName: string) => Promise<void>
  // Prestations (100 % base de données)
  services: Service[]
  addService: (service: Omit<Service, "id">) => Promise<Service>
  updateService: (serviceId: string, patch: ServicePatchInput) => Promise<void>
  removeService: (id: string) => Promise<void>
  approveService: (serviceId: string) => Promise<void>
  rejectService: (serviceId: string, feedback: string) => Promise<void>
  updateServiceAdmin: (serviceId: string, patch: ServicePatchInput) => Promise<void>
  deleteService: (serviceId: string) => Promise<void>
  // Profil prestataire (champs stockés sur le compte)
  updateProfile: (providerName: string, patch: Partial<ProviderProfileData>) => Promise<void>
  // Retraits Mobile Money
  payoutRequests: PayoutRequest[]
  requestPayout: (data: {
    providerName: string
    amountUSD: number
    method: "M-Pesa" | "Orange Money" | "Airtel Money"
    phoneNumber: string
    notes?: string
  }) => Promise<PayoutRequest>
  processPayout: (payoutId: string, transactionRef: string) => Promise<void>
  rejectPayout: (payoutId: string, notes?: string) => Promise<void>
  /** Recharge toutes les données depuis la base. */
  reload: () => Promise<void>
}

const ProviderSpaceContext = createContext<ProviderSpaceContextType | undefined>(undefined)

export function ProviderSpaceProvider({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAdmin()
  const [session, setSession] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<ProviderAccount[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [mounted, setMounted] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const sessionRestored = useRef(false)

  // Session prestataire de l'appareil (confort — pas une donnée métier)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setSession(saved)
    } catch {}
    sessionRestored.current = true
  }, [])

  useEffect(() => {
    if (!sessionRestored.current) return
    try {
      if (session) localStorage.setItem(SESSION_KEY, session)
      else localStorage.removeItem(SESSION_KEY)
    } catch {}
  }, [session])

  const loadAccounts = useCallback(async () => {
    setAccounts(await api.get<ProviderAccount[]>("/api/providers"))
  }, [])

  const loadServices = useCallback(async () => {
    if (isAdmin) {
      setServices(await api.get<Service[]>("/api/services?scope=all"))
      return
    }
    const publicServices = await api.get<Service[]>("/api/services")
    let own: Service[] = []
    if (session) {
      own = await api.get<Service[]>(`/api/services?provider=${encodeURIComponent(session)}`)
    }
    const map = new Map<string, Service>()
    for (const s of own) map.set(s.id, s)
    for (const s of publicServices) map.set(s.id, s)
    setServices(Array.from(map.values()))
  }, [isAdmin, session])

  const loadPayouts = useCallback(async () => {
    if (isAdmin) {
      setPayoutRequests(await api.get<PayoutRequest[]>("/api/payouts?scope=all"))
    } else if (session) {
      setPayoutRequests(await api.get<PayoutRequest[]>(`/api/payouts?provider=${encodeURIComponent(session)}`))
    } else {
      setPayoutRequests([])
    }
  }, [isAdmin, session])

  const reload = useCallback(async () => {
    setDataError(null)
    try {
      await Promise.all([loadAccounts(), loadServices(), loadPayouts()])
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Erreur de chargement des données.")
    }
  }, [loadAccounts, loadServices, loadPayouts])

  // Chargement initial + rechargement à chaque changement de périmètre
  // (connexion prestataire / admin).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setDataError(null)
      try {
        await Promise.all([loadAccounts(), loadServices(), loadPayouts()])
      } catch (err) {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : "Erreur de chargement des données.")
        }
      } finally {
        if (!cancelled) setMounted(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadAccounts, loadServices, loadPayouts])

  const login = useCallback((providerName: string) => setSession(providerName), [])
  const logout = useCallback(() => setSession(null), [])

  const currentAccount = useMemo(() => {
    if (!session) return null
    return accounts.find((a) => a.name.toLowerCase() === session.toLowerCase()) ?? null
  }, [session, accounts])

  // -------------------------------------------------------------------------
  // Comptes prestataires
  // -------------------------------------------------------------------------

  const registerProvider = useCallback(
    async (
      data: Omit<ProviderAccount, "id" | "registeredAt" | "rating" | "reviewsCount" | "avatar">
    ): Promise<ProviderAccount> => {
      const avatarIndex = (accounts.length % 6) + 1
      const account = await api.post<ProviderAccount>("/api/providers", {
        ...data,
        avatar: `/images/avatar-${avatarIndex}.jpg`,
      })
      setAccounts((prev) => [account, ...prev])
      setSession(account.name)
      return account
    },
    [accounts.length]
  )

  const updateAccountStatus = useCallback(
    async (providerName: string, status: ProviderStatus, adminNotes?: string) => {
      const target = accounts.find((a) => a.name.toLowerCase() === providerName.toLowerCase())
      if (!target) throw new Error(`Compte introuvable : ${providerName}`)
      const updated = await api.patch<ProviderAccount>(`/api/providers/${target.id}`, {
        status,
        adminNotes: adminNotes ?? null,
      })
      setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    },
    [accounts]
  )

  const updateAccount = useCallback(
    async (providerName: string, patch: Partial<ProviderAccount>) => {
      const target = accounts.find((a) => a.name.toLowerCase() === providerName.toLowerCase())
      if (!target) throw new Error(`Compte introuvable : ${providerName}`)
      const updated = await api.patch<ProviderAccount>(`/api/providers/${target.id}`, patch)
      setAccounts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    },
    [accounts]
  )

  const deleteAccount = useCallback(
    async (providerName: string) => {
      const target = accounts.find((a) => a.name.toLowerCase() === providerName.toLowerCase())
      if (!target) return
      const res = await fetch(`/api/providers/${target.id}`, { method: "DELETE", credentials: "same-origin" })
      const json = await res.json().catch(() => null)
      if (!res.ok || !json?.ok) throw new Error(json?.error ?? "Erreur lors de la suppression du compte.")
      setAccounts((prev) => prev.filter((a) => a.id !== target.id))
      setServices((prev) =>
        prev.filter((s) => s.provider.name.toLowerCase() !== providerName.toLowerCase())
      )
      setPayoutRequests((prev) =>
        prev.filter((p) => p.providerName.toLowerCase() !== providerName.toLowerCase())
      )
      if (session?.toLowerCase() === providerName.toLowerCase()) setSession(null)
    },
    [accounts, session]
  )

  // -------------------------------------------------------------------------
  // Prestations
  // -------------------------------------------------------------------------

  const addService = useCallback(
    async (data: Omit<Service, "id">): Promise<Service> => {
      const service = await api.post<Service>("/api/services", {
        ...data,
        providerId: currentAccount?.id ?? undefined,
      })
      setServices((prev) => [service, ...prev.filter((s) => s.id !== service.id)])
      return service
    },
    [currentAccount?.id]
  )

  const applyLocalServicePatch = useCallback((serviceId: string, patch: ServicePatchInput) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== serviceId) return s
        return {
          ...s,
          ...patch,
          adminFeedback:
            patch.adminFeedback === null
              ? undefined
              : (patch.adminFeedback ?? s.adminFeedback),
        }
      })
    )
  }, [])

  const updateService = useCallback(
    async (serviceId: string, patch: ServicePatchInput) => {
      await api.patch<Service>(`/api/services/${serviceId}`, patch)
      applyLocalServicePatch(serviceId, patch)
    },
    [applyLocalServicePatch]
  )

  const removeService = useCallback(async (id: string) => {
    const res = await fetch(`/api/services/${id}`, { method: "DELETE", credentials: "same-origin" })
    const json = await res.json().catch(() => null)
    if (!res.ok || !json?.ok) throw new Error(json?.error ?? "Erreur lors de la suppression.")
    setServices((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const approveService = useCallback(
    async (serviceId: string) => {
      await api.patch<Service>(`/api/services/${serviceId}`, {
        adminApprovalStatus: "approved",
        adminFeedback: null,
      })
      applyLocalServicePatch(serviceId, { adminApprovalStatus: "approved", adminFeedback: null })
    },
    [applyLocalServicePatch]
  )

  const rejectService = useCallback(
    async (serviceId: string, feedback: string) => {
      await api.patch<Service>(`/api/services/${serviceId}`, {
        adminApprovalStatus: "rejected",
        adminFeedback: feedback,
      })
      applyLocalServicePatch(serviceId, { adminApprovalStatus: "rejected", adminFeedback: feedback })
    },
    [applyLocalServicePatch]
  )

  const updateServiceAdmin = useCallback(
    async (serviceId: string, patch: ServicePatchInput) => {
      await api.patch<Service>(`/api/services/${serviceId}`, patch)
      applyLocalServicePatch(serviceId, patch)
    },
    [applyLocalServicePatch]
  )

  const deleteService = useCallback(
    async (serviceId: string) => {
      await api.patch<Service>(`/api/services/${serviceId}`, { isDeleted: true })
      applyLocalServicePatch(serviceId, { isDeleted: true })
    },
    [applyLocalServicePatch]
  )

  // -------------------------------------------------------------------------
  // Profil + retraits
  // -------------------------------------------------------------------------

  const updateProfile = useCallback(
    async (providerName: string, patch: Partial<ProviderProfileData>) => {
      await updateAccount(providerName, patch)
    },
    [updateAccount]
  )

  const requestPayout = useCallback(
    async (data: {
      providerName: string
      amountUSD: number
      method: "M-Pesa" | "Orange Money" | "Airtel Money"
      phoneNumber: string
      notes?: string
    }): Promise<PayoutRequest> => {
      const payout = await api.post<PayoutRequest>("/api/payouts", data)
      setPayoutRequests((prev) => [payout, ...prev])
      return payout
    },
    []
  )

  const processPayout = useCallback(async (payoutId: string, transactionRef: string) => {
    const updated = await api.patch<PayoutRequest>(`/api/payouts/${payoutId}`, {
      action: "process",
      transactionRef,
    })
    setPayoutRequests((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }, [])

  const rejectPayout = useCallback(async (payoutId: string, notes?: string) => {
    const updated = await api.patch<PayoutRequest>(`/api/payouts/${payoutId}`, {
      action: "reject",
      notes,
    })
    setPayoutRequests((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }, [])

  return (
    <ProviderSpaceContext.Provider
      value={{
        mounted,
        dataError,
        session,
        currentAccount,
        login,
        logout,
        accounts,
        registerProvider,
        updateAccountStatus,
        updateAccount,
        deleteAccount,
        services,
        addService,
        updateService,
        removeService,
        approveService,
        rejectService,
        updateServiceAdmin,
        deleteService,
        updateProfile,
        payoutRequests,
        requestPayout,
        processPayout,
        rejectPayout,
        reload,
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

/** Toutes les prestations visibles par l'utilisateur courant (périmètre DB chargé). */
export function useMergedServices(): Service[] {
  const { services } = useProviderSpace()
  return services
}

/** Vitrine publique : prestations approuvées, en ligne, prestataire non suspendu. */
export function usePublicServices(): Service[] {
  const { services, accounts } = useProviderSpace()
  const suspendedProviders = useMemo(
    () => new Set(accounts.filter((a) => a.status === "suspended").map((a) => a.name.toLowerCase())),
    [accounts]
  )

  return useMemo(() => {
    return services.filter((s) => {
      if (s.isDeleted) return false
      if (s.paused) return false
      if (suspendedProviders.has(s.provider.name.toLowerCase())) return false
      return s.adminApprovalStatus === "approved"
    })
  }, [services, suspendedProviders])
}

export function useProviderServices(providerName: string): Service[] {
  const services = useMergedServices()
  return useMemo(
    () =>
      services.filter(
        (s) => !s.isDeleted && s.provider.name.toLowerCase() === providerName.toLowerCase()
      ),
    [services, providerName]
  )
}

/** Profil public d'un prestataire, dérivé de son compte en base. */
export function useProviderProfile(providerName: string | null): ProviderProfileData {
  const { accounts } = useProviderSpace()
  const account = providerName
    ? accounts.find((a) => a.name.toLowerCase() === providerName.toLowerCase())
    : undefined
  return {
    phone: account?.phone,
    whatsapp: account?.whatsapp,
    email: account?.email,
    bio: account?.bio,
    payoutMethod: account?.payoutMethod,
    payoutNumber: account?.payoutNumber,
  }
}
