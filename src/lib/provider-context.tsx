"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  PayoutRequest,
  ProviderAccount,
  ProviderProfileData,
  ProviderStatus,
  Service,
  ServiceOverride,
} from "./types"
import { services as catalogServices } from "./data"

const SESSION_KEY = "sb-rdc-provider-session"
const OVERRIDES_KEY = "sb-rdc-provider-overrides"
const CUSTOM_SERVICES_KEY = "sb-rdc-custom-services"
const PROVIDER_PROFILES_KEY = "sb-rdc-provider-profiles"
const PROVIDER_ACCOUNTS_KEY = "sb-rdc-provider-accounts"
const PROVIDER_PAYOUTS_KEY = "sb-rdc-provider-payouts"

export const INITIAL_ACCOUNTS: ProviderAccount[] = [
  {
    id: "prov-grand-salon",
    name: "Grand Salon Kin",
    contactPerson: "Dieudonné Makiese",
    phone: "+243 821 110 021",
    whatsapp: "+243 821 110 021",
    email: "contact@grandsalonkin.cd",
    city: "Kinshasa",
    location: "Gombe · Av. du 24 novembre",
    category: "salles",
    experience: "15 ans d'expérience",
    bio: "Salle de prestige de 300 places climatisée avec parking sécurisé au cœur de la Gombe.",
    rccm: "CD/KIN/RCCM/18-B-0429",
    status: "approved",
    rating: 4.9,
    reviewsCount: 148,
    verified: true,
    avatar: "/images/avatar-1.jpg",
    registeredAt: "2025-01-10T10:00:00.000Z",
  },
  {
    id: "prov-palais-katanga",
    name: "Palais du Katanga",
    contactPerson: "Chantal Tshilombo",
    phone: "+243 998 770 032",
    whatsapp: "+243 998 770 032",
    email: "reservation@palaiskatanga.cd",
    city: "Lubumbashi",
    location: "Golf Météo · Av. des Baobabs",
    category: "salles",
    experience: "10 ans d'expérience",
    bio: "Complexe événementiel d'exception de 500 places à Lubumbashi.",
    rccm: "CD/LSH/RCCM/19-A-1102",
    status: "approved",
    rating: 4.8,
    reviewsCount: 96,
    verified: true,
    avatar: "/images/avatar-2.jpg",
    registeredAt: "2025-02-14T08:30:00.000Z",
  },
  {
    id: "prov-kivu-lake",
    name: "Kivu Lake View Gardens",
    contactPerson: "Jacques Safari",
    phone: "+243 971 445 566",
    whatsapp: "+243 971 445 566",
    email: "contact@kivugardens.cd",
    city: "Goma",
    location: "Himbi · Bord du Lac Kivu",
    category: "salles",
    experience: "8 ans d'expérience",
    bio: "Jardins et chapiteau panoramique les pieds dans l'eau pour cérémonies inoubliables.",
    rccm: "CD/GOM/RCCM/21-B-0834",
    status: "approved",
    rating: 4.9,
    reviewsCount: 112,
    verified: true,
    avatar: "/images/avatar-3.jpg",
    registeredAt: "2025-03-01T12:00:00.000Z",
  },
  {
    id: "prov-saveurs-kin",
    name: "Saveurs du Fleuve Traiteur",
    contactPerson: "Chef Aimé Bamporiki",
    phone: "+243 810 990 044",
    whatsapp: "+243 810 990 044",
    email: "traiteur@saveursdufleuve.cd",
    city: "Kinshasa",
    location: "Ngaliema · Ma Campagne",
    category: "traiteur",
    experience: "12 ans d'expérience",
    bio: "Haute gastronomie congolaise et buffet international pour mariages et réceptions VIP.",
    status: "approved",
    rating: 4.9,
    reviewsCount: 204,
    verified: true,
    avatar: "/images/avatar-4.jpg",
    registeredAt: "2025-01-20T14:15:00.000Z",
  },
  {
    id: "prov-lumumba-events",
    name: "Lumumba Événements Déco",
    contactPerson: "Nathalie Kalonji",
    phone: "+243 854 321 009",
    whatsapp: "+243 854 321 009",
    email: "deco@lumumbaevents.cd",
    city: "Kinshasa",
    location: "Limete · 7e Rue Résidentiel",
    category: "decoration",
    experience: "9 ans d'expérience",
    bio: "Créations florales d'exception, trônes de mariés et scénographie lumineuse moderne.",
    status: "approved",
    rating: 5.0,
    reviewsCount: 88,
    verified: true,
    avatar: "/images/avatar-5.jpg",
    registeredAt: "2025-02-05T09:00:00.000Z",
  },
  {
    id: "prov-sound-kin",
    name: "Kinshasa Sound & Light VIP",
    contactPerson: "DJ Rodrigue",
    phone: "+243 900 234 567",
    whatsapp: "+243 900 234 567",
    email: "booking@kinsoundvip.cd",
    city: "Kinshasa",
    location: "Kalamu · Victoire",
    category: "sono",
    experience: "11 ans d'expérience",
    bio: "Système line array 10 000 Watts, projecteurs robotisés, fumée lourde et DJ animateur polyglotte.",
    status: "approved",
    rating: 4.9,
    reviewsCount: 167,
    verified: true,
    avatar: "/images/avatar-6.jpg",
    registeredAt: "2025-01-28T16:45:00.000Z",
  },
]

export const INITIAL_PAYOUTS: PayoutRequest[] = [
  {
    id: "payout-01",
    providerName: "Grand Salon Kin",
    amountUSD: 300,
    amountFC: 855000,
    method: "M-Pesa",
    phoneNumber: "+243 821 110 021",
    status: "paid",
    requestedAt: "2026-09-15T10:00:00.000Z",
    processedAt: "2026-09-15T14:30:00.000Z",
    transactionRef: "MPESA-992384-KIN",
    notes: "Acomptes réservations mariage week-end",
  },
  {
    id: "payout-02",
    providerName: "Saveurs du Fleuve Traiteur",
    amountUSD: 450,
    amountFC: 1282500,
    method: "Orange Money",
    phoneNumber: "+243 854 321 009",
    status: "pending",
    requestedAt: "2026-09-18T16:20:00.000Z",
    notes: "Retrait acomptes buffet VIP",
  },
]

type ProviderSpaceContextType = {
  mounted: boolean
  session: string | null
  currentAccount: ProviderAccount | null
  login: (providerName: string) => void
  logout: () => void
  accounts: ProviderAccount[]
  registerProvider: (data: Omit<ProviderAccount, "id" | "registeredAt" | "rating" | "reviewsCount" | "avatar">) => ProviderAccount
  updateAccountStatus: (providerName: string, status: ProviderStatus, adminNotes?: string) => void
  updateAccount: (providerName: string, patch: Partial<ProviderAccount>) => void
  deleteAccount: (providerName: string) => void
  overrides: Record<string, ServiceOverride>
  setOverride: (serviceId: string, patch: Partial<ServiceOverride>) => void
  customServices: Service[]
  addCustomService: (service: Omit<Service, "id">) => Service
  removeCustomService: (id: string) => void
  profiles: Record<string, ProviderProfileData>
  updateProfile: (providerName: string, patch: Partial<ProviderProfileData>) => void
  // Administration des services
  approveService: (serviceId: string) => void
  rejectService: (serviceId: string, feedback: string) => void
  updateServiceAdmin: (serviceId: string, patch: Partial<ServiceOverride>) => void
  deleteService: (serviceId: string) => void
  // Retraits Mobile Money
  payoutRequests: PayoutRequest[]
  requestPayout: (data: {
    providerName: string
    amountUSD: number
    method: "M-Pesa" | "Orange Money" | "Airtel Money"
    phoneNumber: string
    notes?: string
  }) => PayoutRequest
  processPayout: (payoutId: string, transactionRef: string) => void
  rejectPayout: (payoutId: string, notes?: string) => void
}

const ProviderSpaceContext = createContext<ProviderSpaceContextType | undefined>(undefined)

export function applyOverride(service: Service, override?: ServiceOverride): Service {
  if (!override) {
    return {
      ...service,
      adminApprovalStatus: service.custom ? (service.adminApprovalStatus ?? "pending") : "approved",
    }
  }
  return {
    ...service,
    name: override.name ?? service.name,
    category: override.category ?? service.category,
    city: override.city ?? service.city,
    location: override.location ?? service.location,
    description: override.description ?? service.description,
    price: override.price ?? service.price,
    instant: override.instant ?? service.instant,
    paused: override.paused ?? service.paused,
    adminApprovalStatus: override.adminApprovalStatus ?? (service.custom ? (service.adminApprovalStatus ?? "pending") : "approved"),
    adminFeedback: override.adminFeedback ?? service.adminFeedback,
    isDeleted: override.isDeleted ?? service.isDeleted,
  }
}

export function ProviderSpaceProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<ProviderAccount[]>(INITIAL_ACCOUNTS)
  const [overrides, setOverrides] = useState<Record<string, ServiceOverride>>({})
  const [customServices, setCustomServices] = useState<Service[]>([])
  const [profiles, setProfiles] = useState<Record<string, ProviderProfileData>>({})
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(INITIAL_PAYOUTS)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedSession) setSession(savedSession)
      const savedAccounts = localStorage.getItem(PROVIDER_ACCOUNTS_KEY)
      if (savedAccounts) {
        const parsed: ProviderAccount[] = JSON.parse(savedAccounts)
        const merged = [...INITIAL_ACCOUNTS]
        for (const p of parsed) {
          const idx = merged.findIndex((m) => m.name.toLowerCase() === p.name.toLowerCase())
          if (idx >= 0) merged[idx] = p
          else merged.push(p)
        }
        setAccounts(merged)
      }
      const savedOverrides = localStorage.getItem(OVERRIDES_KEY)
      if (savedOverrides) setOverrides(JSON.parse(savedOverrides))
      const savedCustom = localStorage.getItem(CUSTOM_SERVICES_KEY)
      if (savedCustom) setCustomServices(JSON.parse(savedCustom))
      const savedProfiles = localStorage.getItem(PROVIDER_PROFILES_KEY)
      if (savedProfiles) setProfiles(JSON.parse(savedProfiles))
      const savedPayouts = localStorage.getItem(PROVIDER_PAYOUTS_KEY)
      if (savedPayouts) {
        setPayoutRequests(JSON.parse(savedPayouts))
      }
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
    if (mounted) localStorage.setItem(PROVIDER_ACCOUNTS_KEY, JSON.stringify(accounts))
  }, [accounts, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
  }, [overrides, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem(CUSTOM_SERVICES_KEY, JSON.stringify(customServices))
  }, [customServices, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem(PROVIDER_PROFILES_KEY, JSON.stringify(profiles))
  }, [profiles, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem(PROVIDER_PAYOUTS_KEY, JSON.stringify(payoutRequests))
  }, [payoutRequests, mounted])

  const login = (providerName: string) => {
    setSession(providerName)
  }

  const logout = () => {
    setSession(null)
  }

  const currentAccount = useMemo(() => {
    if (!session) return null
    return accounts.find((a) => a.name.toLowerCase() === session.toLowerCase()) ?? null
  }, [session, accounts])

  const registerProvider = (
    data: Omit<ProviderAccount, "id" | "registeredAt" | "rating" | "reviewsCount" | "avatar">
  ): ProviderAccount => {
    const avatarIndex = (accounts.length % 6) + 1
    const newAccount: ProviderAccount = {
      ...data,
      id: `prov-${Math.random().toString(36).slice(2, 9)}`,
      status: "pending",
      rating: 5.0,
      reviewsCount: 0,
      avatar: `/images/avatar-${avatarIndex}.jpg`,
      registeredAt: new Date().toISOString(),
    }
    setAccounts((prev) => [newAccount, ...prev])
    setSession(newAccount.name)
    return newAccount
  }

  const updateAccountStatus = (providerName: string, status: ProviderStatus, adminNotes?: string) => {
    setAccounts((prev) =>
      prev.map((a) =>
        a.name.toLowerCase() === providerName.toLowerCase()
          ? {
              ...a,
              status,
              verified: status === "approved" ? true : a.verified,
              adminNotes: adminNotes ?? a.adminNotes,
            }
          : a
      )
    )
  }

  const updateAccount = (providerName: string, patch: Partial<ProviderAccount>) => {
    setAccounts((prev) =>
      prev.map((a) => (a.name.toLowerCase() === providerName.toLowerCase() ? { ...a, ...patch } : a))
    )
  }

  const deleteAccount = (providerName: string) => {
    setAccounts((prev) => prev.filter((a) => a.name.toLowerCase() !== providerName.toLowerCase()))
    if (session?.toLowerCase() === providerName.toLowerCase()) {
      setSession(null)
    }
  }

  const setOverride = (serviceId: string, patch: Partial<ServiceOverride>) => {
    setOverrides((prev) => ({ ...prev, [serviceId]: { ...prev[serviceId], ...patch } }))
  }

  const addCustomService = (data: Omit<Service, "id">) => {
    const newService: Service = {
      ...data,
      id: `custom-${Math.random().toString(36).slice(2, 9)}`,
      custom: true,
      adminApprovalStatus: "pending",
    }
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

  const approveService = (serviceId: string) => {
    setOverrides((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], adminApprovalStatus: "approved", adminFeedback: undefined },
    }))
  }

  const rejectService = (serviceId: string, feedback: string) => {
    setOverrides((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], adminApprovalStatus: "rejected", adminFeedback: feedback },
    }))
  }

  const updateServiceAdmin = (serviceId: string, patch: Partial<ServiceOverride>) => {
    setOverrides((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], ...patch },
    }))
  }

  const deleteService = (serviceId: string) => {
    setOverrides((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], isDeleted: true },
    }))
  }

  // Gestion des retraits Mobile Money
  const requestPayout = (data: {
    providerName: string
    amountUSD: number
    method: "M-Pesa" | "Orange Money" | "Airtel Money"
    phoneNumber: string
    notes?: string
  }): PayoutRequest => {
    const newPayout: PayoutRequest = {
      id: `payout-${Math.random().toString(36).slice(2, 9)}`,
      providerName: data.providerName,
      amountUSD: data.amountUSD,
      amountFC: Math.round(data.amountUSD * 2850),
      method: data.method,
      phoneNumber: data.phoneNumber,
      status: "pending",
      requestedAt: new Date().toISOString(),
      notes: data.notes,
    }
    setPayoutRequests((prev) => [newPayout, ...prev])
    return newPayout
  }

  const processPayout = (payoutId: string, transactionRef: string) => {
    setPayoutRequests((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: "paid" as const,
              processedAt: new Date().toISOString(),
              transactionRef,
            }
          : p
      )
    )
  }

  const rejectPayout = (payoutId: string, notes?: string) => {
    setPayoutRequests((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: "rejected" as const,
              processedAt: new Date().toISOString(),
              notes: notes || p.notes,
            }
          : p
      )
    )
  }

  return (
    <ProviderSpaceContext.Provider
      value={{
        mounted,
        session,
        currentAccount,
        login,
        logout,
        accounts,
        registerProvider,
        updateAccountStatus,
        updateAccount,
        deleteAccount,
        overrides,
        setOverride,
        customServices,
        addCustomService,
        removeCustomService,
        profiles,
        updateProfile,
        approveService,
        rejectService,
        updateServiceAdmin,
        deleteService,
        payoutRequests,
        requestPayout,
        processPayout,
        rejectPayout,
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

export function useMergedServices(): Service[] {
  const { overrides, customServices } = useProviderSpace()
  return useMemo(
    () => [...catalogServices, ...customServices].map((s) => applyOverride(s, overrides[s.id])),
    [overrides, customServices]
  )
}

export function usePublicServices(): Service[] {
  const merged = useMergedServices()
  const { accounts } = useProviderSpace()
  const suspendedProviders = useMemo(
    () => new Set(accounts.filter((a) => a.status === "suspended").map((a) => a.name.toLowerCase())),
    [accounts]
  )

  return useMemo(() => {
    return merged.filter((s) => {
      if (s.isDeleted) return false
      if (s.paused) return false
      if (suspendedProviders.has(s.provider.name.toLowerCase())) return false
      return s.adminApprovalStatus === "approved"
    })
  }, [merged, suspendedProviders])
}

export function useProviderServices(providerName: string): Service[] {
  const merged = useMergedServices()
  return useMemo(
    () =>
      merged.filter(
        (s) => !s.isDeleted && s.provider.name.toLowerCase() === providerName.toLowerCase()
      ),
    [merged, providerName]
  )
}

export function useProviderProfile(providerName: string | null): ProviderProfileData {
  const { profiles } = useProviderSpace()
  return (providerName && profiles[providerName]) || {}
}
