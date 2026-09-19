"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { CartItem, QuoteData, Service, Booking } from "./types"
import { useBookings } from "./booking-context"
import { useProviderSpace } from "./provider-context"
import { resolvePaymentDestination, splitPayment } from "./commission"
import { format, addDays } from "date-fns"
import { syncQuote } from "./supabase/sync"

const CART_KEY = "sb-rdc-cart"

type CartContextType = {
  items: CartItem[]
  mounted: boolean
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
  }) => QuoteData
  checkoutCart: (customer: {
    name: string
    phone: string
    email?: string
    paymentMethod: string
    ceremonyTitle?: string
  }) => Booking[]
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const USD_TO_FC_RATE = 2850

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const { addBooking, addEvent } = useBookings()
  const { accounts } = useProviderSpace()

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_KEY, JSON.stringify(items))
    }
  }, [items, mounted])

  const isInCart = (serviceId: string) => items.some((i) => i.serviceId === serviceId)

  const addItem = (service: Service, date?: string, time?: string, notes?: string): boolean => {
    if (isInCart(service.id)) return false

    const defaultDate = date || format(addDays(new Date(), 14), "yyyy-MM-dd")
    const defaultTime = time || "10:00"

    const newItem: CartItem = {
      id: `cart-${Math.random().toString(36).slice(2, 9)}`,
      serviceId: service.id,
      service,
      date: defaultDate,
      time: defaultTime,
      notes: notes || "",
    }
    setItems((prev) => [...prev, newItem])
    return true
  }

  const updateItem = (itemId: string, patch: Partial<Omit<CartItem, "id" | "serviceId" | "service">>) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)))
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const clearCart = () => {
    setItems([])
  }

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

  const generateQuote = (customer: {
    name: string
    phone: string
    email?: string
    ceremonyType?: string
    city?: string
    notes?: string
  }): QuoteData => {
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
    // Miroir Supabase : devis pro-forma enregistré (no-op si base non configurée)
    syncQuote(quote)
    return quote
  }

  const checkoutCart = (customer: {
    name: string
    phone: string
    email?: string
    paymentMethod: string
    ceremonyTitle?: string
  }): Booking[] => {
    if (items.length === 0) return []

    // Si plus d'1 service, créer automatiquement une cérémonie liée
    let eventId: string | undefined
    if (items.length > 1 || customer.ceremonyTitle) {
      const createdEvent = addEvent({
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
      const b = addBooking({
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
      createdBookings.push(b)
    }

    clearCart()
    return createdBookings
  }

  return (
    <CartContext.Provider
      value={{
        items,
        mounted,
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
