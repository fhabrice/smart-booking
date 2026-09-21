"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { CartItem, QuoteData, Service, Booking } from "./types"
import { useBookings } from "./booking-context"
import { useProviderSpace } from "./provider-context"
import { resolvePaymentDestination, splitPayment } from "./commission"
import { format, addDays } from "date-fns"
import { api } from "./api"

/**
 * Panier multi-prestations & devis — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * Le panier est stocké en base (table `cart_items`) et rattaché à un
 * identifiant de session anonyme conservé par le navigateur du visiteur :
 * le panier survit aux rechargements et reste synchronisé avec la base.
 * Aucun contenu n'est codé en dur : les prestations ajoutées proviennent du
 * catalogue chargé depuis la base de données.
 */

const CART_SESSION_KEY = "sb-rdc-cart-session"

function getOrCreateSessionId(): string {
  try {
    let id = localStorage.getItem(CART_SESSION_KEY)
    if (!id) {
      id = `cart-${crypto.randomUUID()}`
      localStorage.setItem(CART_SESSION_KEY, id)
    }
    return id
  } catch {
    return `cart-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  }
}

type CartContextType = {
  items: CartItem[]
  mounted: boolean
  dataError: string | null
  addItem: (service: Service, date?: string, time?: string, notes?: string) => boolean
  updateItem: (itemId: string, patch: Partial<Omit<CartItem, "id" | "serviceId" | "service">>) => void
  removeItem: (itemId: string) => void
  clearCart: () => void
  isInCart: (serviceId: string) => boolean
  itemCount: number
  subtotalUSD: number
  subtotalFC: number
  discountUSD: number
  discountFC: number
  totalUSD: number
  totalFC: number
  depositUSD: number
  depositFC: number
  balanceUSD: number
  balanceFC: number
  generateQuote: (customer: {
    name: string
    phone: string
    email?: string
    ceremonyType?: string
    city?: string
    notes?: string
  }) => Promise<QuoteData>
  checkoutCart: (customer: {
    name: string
    phone: string
    email?: string
    paymentMethod: string
    ceremonyTitle?: string
  }) => Promise<Booking[]>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const USD_TO_FC_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_FC_RATE ?? 2850) || 2850

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const sessionId = useRef<string>("")
  const syncQueue = useRef<Promise<void>>(Promise.resolve())
  const { addBooking, addEvent } = useBookings()
  const { accounts } = useProviderSpace()

  // Chargement du panier depuis la base
  useEffect(() => {
    sessionId.current = getOrCreateSessionId()
    let cancelled = false
    ;(async () => {
      try {
        const loaded = await api.get<CartItem[]>(`/api/cart?session=${encodeURIComponent(sessionId.current)}`)
        if (!cancelled) setItems(loaded)
      } catch (err) {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : "Erreur de chargement du panier.")
        }
      } finally {
        if (!cancelled) setMounted(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /** Pousse l'état complet du panier vers la base (sérialisé, anti-course). */
  const persist = useCallback((next: CartItem[]) => {
    const session = sessionId.current
    if (!session) return
    syncQueue.current = syncQueue.current.then(async () => {
      try {
        await api.put("/api/cart", {
          session,
          items: next.map((i) => ({ serviceId: i.serviceId, date: i.date, time: i.time, notes: i.notes })),
        })
      } catch (err) {
        console.warn("[cart] synchronisation:", err)
      }
    })
  }, [])

  const mutate = useCallback(
    (updater: (prev: CartItem[]) => CartItem[]) => {
      setItems((prev) => {
        const next = updater(prev)
        persist(next)
        return next
      })
    },
    [persist]
  )

  const isInCart = useCallback((serviceId: string) => items.some((i) => i.serviceId === serviceId), [items])

  const addItem = useCallback(
    (service: Service, date?: string, time?: string, notes?: string): boolean => {
      if (isInCart(service.id)) return false

      const newItem: CartItem = {
        id: `cart-${Math.random().toString(36).slice(2, 9)}`,
        serviceId: service.id,
        service,
        date: date || format(addDays(new Date(), 14), "yyyy-MM-dd"),
        time: time || "10:00",
        notes: notes || "",
      }
      mutate((prev) => [...prev, newItem])
      return true
    },
    [isInCart, mutate]
  )

  const updateItem = useCallback(
    (itemId: string, patch: Partial<Omit<CartItem, "id" | "serviceId" | "service">>) => {
      mutate((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)))
    },
    [mutate]
  )

  const removeItem = useCallback(
    (itemId: string) => {
      mutate((prev) => prev.filter((item) => item.id !== itemId))
    },
    [mutate]
  )

  const clearCart = useCallback(() => {
    mutate(() => [])
  }, [mutate])

  const subtotalUSD = useMemo(() => items.reduce((sum, item) => sum + item.service.price, 0), [items])
  const subtotalFC = Math.round(subtotalUSD * USD_TO_FC_RATE)

  // Remise Pack Cérémonie : 5% dès 3 services réservés ensemble
  const discountUSD = useMemo(() => {
    if (items.length >= 3) {
      return Math.round(subtotalUSD * 0.05)
    }
    return 0
  }, [items.length, subtotalUSD])
  const discountFC = Math.round(discountUSD * USD_TO_FC_RATE)

  const totalUSD = subtotalUSD - discountUSD
  const totalFC = Math.round(totalUSD * USD_TO_FC_RATE)

  const depositUSD = Math.round(totalUSD * 0.5)
  const depositFC = Math.round(depositUSD * USD_TO_FC_RATE)

  const balanceUSD = totalUSD - depositUSD
  const balanceFC = Math.round(balanceUSD * USD_TO_FC_RATE)

  const generateQuote = useCallback(
    async (customer: {
      name: string
      phone: string
      email?: string
      ceremonyType?: string
      city?: string
      notes?: string
    }): Promise<QuoteData> => {
      const quoteNumber = `DEV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      const quote: QuoteData = {
        quoteNumber,
        date: format(new Date(), "yyyy-MM-dd"),
        validUntil: format(addDays(new Date(), 30), "yyyy-MM-dd"),
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        ceremonyType: customer.ceremonyType || "Mariage & Cérémonie",
        ceremonyDate: items[0]?.date || format(addDays(new Date(), 14), "yyyy-MM-dd"),
        city: customer.city || items[0]?.service.city || "Kinshasa",
        items,
        subtotal: subtotalUSD,
        discount: discountUSD,
        total: totalUSD,
        deposit: depositUSD,
        balance: balanceUSD,
        notes: customer.notes,
      }
      // Enregistrement du devis pro-forma en base
      await api.post("/api/quotes", { ...quote, sessionId: sessionId.current })
      return quote
    },
    [items, subtotalUSD, discountUSD, totalUSD, depositUSD, balanceUSD]
  )

  const checkoutCart = useCallback(
    async (customer: {
      name: string
      phone: string
      email?: string
      paymentMethod: string
      ceremonyTitle?: string
    }): Promise<Booking[]> => {
      if (items.length === 0) return []

      // Si plus d'1 service, créer automatiquement une cérémonie liée
      let eventId: string | undefined
      if (items.length > 1 || customer.ceremonyTitle) {
        const createdEvent = await addEvent({
          id: `event-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`,
          type: "mariage",
          title: customer.ceremonyTitle || `Pack Cérémonie — ${customer.name}`,
          date: items[0]?.date || format(addDays(new Date(), 14), "yyyy-MM-dd"),
          time: items[0]?.time || "10:00",
          city: items[0]?.service.city || "Kinshasa",
          venue: "Plusieurs prestataires réservés",
          guests: 150,
          budget: totalUSD,
          notes: `Réservation groupée de ${items.length} prestations sur Smart Booking RDC`,
        })
        eventId = createdEvent.id
      }

      const createdBookings: Booking[] = []

      for (const item of items) {
        const itemDeposit = Math.round(item.service.price * 0.5)
        // Paiement direct au prestataire : compte fourni à son inscription.
        // La commission de service (interne, non affichée) est calculée ici.
        const providerAccount = accounts.find(
          (a) => a.name.toLowerCase() === item.service.provider.name.toLowerCase()
        )
        const payoutDest = resolvePaymentDestination(providerAccount)
        const depositSplit = splitPayment(itemDeposit)
        const booking = await addBooking({
          eventId,
          serviceId: item.service.id,
          serviceName: item.service.name,
          serviceImage: item.service.image,
          serviceCategory: item.service.category,
          date: item.date,
          time: item.time,
          duration: item.service.duration,
          price: item.service.price,
          deposit: itemDeposit,
          paymentMethod: customer.paymentMethod,
          customerName: customer.name,
          customerPhone: customer.phone,
          customerEmail: customer.email,
          providerName: item.service.provider.name,
          location: item.service.location,
          city: item.service.city,
          status: item.service.instant ? "confirmed" : "pending",
          providerPayoutMethod: payoutDest.method,
          providerPayoutNumber: payoutDest.number,
          platformFeeUSD: depositSplit.platformFeeUSD,
          providerNetUSD: depositSplit.providerNetUSD,
        })
        createdBookings.push(booking)
      }

      clearCart()
      return createdBookings
    },
    [items, accounts, addEvent, addBooking, totalUSD, clearCart]
  )

  return (
    <CartContext.Provider
      value={{
        items,
        mounted,
        dataError,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        isInCart,
        itemCount: items.length,
        subtotalUSD,
        subtotalFC,
        discountUSD,
        discountFC,
        totalUSD,
        totalFC,
        depositUSD,
        depositFC,
        balanceUSD,
        balanceFC,
        generateQuote,
        checkoutCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
