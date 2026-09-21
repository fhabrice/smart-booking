"use client"

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { Booking, CeremonyEvent, Service } from "./types"
import { api } from "./api"
import { useProviderSpace } from "./provider-context"
import { useAdmin } from "./admin-context"

/**
 * Réservations & cérémonies — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * Toutes les réservations et cérémonies vivent dans la base de données
 * (tables `bookings` / `ceremony_events`), atteintes via /api/bookings et
 * /api/events. Le navigateur ne conserve que la liste des IDENTIFIANTS des
 * réservations/cérémonies créées depuis cet appareil (simple pointeur local
 * — les données elles-mêmes sont toujours relues en base).
 *
 * Périmètres chargés :
 *   • visiteur      → ses propres réservations (identifiants de l'appareil)
 *   • prestataire   → + toutes les réservations reçues par son établissement
 *   • administrateur→ toutes les réservations de la plateforme
 */

type NewBooking = Omit<Booking, "id" | "createdAt" | "status"> & { status?: Booking["status"] }

type BookingContextType = {
  bookings: Booking[]
  events: CeremonyEvent[]
  mounted: boolean
  dataError: string | null
  addBooking: (booking: NewBooking) => Promise<Booking>
  cancelBooking: (id: string) => Promise<void>
  updateBookingStatus: (id: string, status: Booking["status"]) => Promise<void>
  isSlotBooked: (date: string, time: string, serviceId: string) => boolean
  addEvent: (event: Omit<CeremonyEvent, "id" | "createdAt"> & { id?: string }) => Promise<CeremonyEvent>
  getEvent: (id: string) => CeremonyEvent | undefined
  getEventBookings: (eventId: string) => Booking[]
  eventBudgetUsed: (eventId: string) => number
  reload: () => Promise<void>
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

const BOOKING_IDS_KEY = "sb-rdc-booking-ids"
const EVENT_IDS_KEY = "sb-rdc-event-ids"

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : []
  } catch {
    return []
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(ids.slice(0, 200)))
  } catch {}
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { session } = useProviderSpace()
  const { isAdmin } = useAdmin()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [events, setEvents] = useState<CeremonyEvent[]>([])
  const [mounted, setMounted] = useState(false)
  const [dataError, setDataError] = useState<string | null>(null)
  const deviceIds = useRef<string[]>([])
  const deviceEventIds = useRef<string[]>([])

  const loadBookings = useCallback(async () => {
    if (isAdmin) {
      setBookings(await api.get<Booking[]>("/api/bookings?scope=all"))
      return
    }
    const byId = new Map<string, Booking>()
    if (session) {
      const own = await api.get<Booking[]>(`/api/bookings?provider=${encodeURIComponent(session)}`)
      own.forEach((b) => byId.set(b.id, b))
    }
    if (deviceIds.current.length > 0) {
      const mine = await api.get<Booking[]>(
        `/api/bookings?ids=${encodeURIComponent(deviceIds.current.join(","))}`
      )
      mine.forEach((b) => byId.set(b.id, b))
    }
    setBookings(
      Array.from(byId.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    )
  }, [isAdmin, session])

  const loadEvents = useCallback(async () => {
    if (deviceEventIds.current.length === 0) {
      setEvents([])
      return
    }
    const list = await api.get<CeremonyEvent[]>(
      `/api/events?ids=${encodeURIComponent(deviceEventIds.current.join(","))}`
    )
    setEvents(list)
  }, [])

  const reload = useCallback(async () => {
    await Promise.all([loadBookings(), loadEvents()])
  }, [loadBookings, loadEvents])

  useEffect(() => {
    deviceIds.current = readIds(BOOKING_IDS_KEY)
    deviceEventIds.current = readIds(EVENT_IDS_KEY)
    let cancelled = false
    ;(async () => {
      setDataError(null)
      try {
        await Promise.all([loadBookings(), loadEvents()])
      } catch (err) {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : "Erreur de chargement des réservations.")
        }
      } finally {
        if (!cancelled) setMounted(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadBookings, loadEvents])

  const addBooking = useCallback(async (data: NewBooking): Promise<Booking> => {
    const booking = await api.post<Booking>("/api/bookings", {
      ...data,
      status: data.status ?? "pending",
    })
    setBookings((prev) => [booking, ...prev])
    deviceIds.current = [booking.id, ...deviceIds.current]
    writeIds(BOOKING_IDS_KEY, deviceIds.current)
    return booking
  }, [])

  const updateBookingStatus = useCallback(async (id: string, status: Booking["status"]) => {
    const updated = await api.patch<Booking>(`/api/bookings/${id}`, { status })
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
  }, [])

  const cancelBooking = useCallback(
    async (id: string) => {
      await updateBookingStatus(id, "cancelled")
    },
    [updateBookingStatus]
  )

  const isSlotBooked = useCallback(
    (date: string, time: string, serviceId: string) => {
      return bookings.some(
        (b) => b.date === date && b.time === time && b.serviceId === serviceId && b.status !== "cancelled"
      )
    },
    [bookings]
  )

  const addEvent = useCallback(
    async (data: Omit<CeremonyEvent, "id" | "createdAt"> & { id?: string }): Promise<CeremonyEvent> => {
      const event = await api.post<CeremonyEvent>("/api/events", data)
      setEvents((prev) => [event, ...prev])
      deviceEventIds.current = [event.id, ...deviceEventIds.current]
      writeIds(EVENT_IDS_KEY, deviceEventIds.current)
      return event
    },
    []
  )

  const getEvent = useCallback((id: string) => events.find((e) => e.id === id), [events])

  const getEventBookings = useCallback(
    (eventId: string) => bookings.filter((b) => b.eventId === eventId && b.status !== "cancelled"),
    [bookings]
  )

  const eventBudgetUsed = useCallback(
    (eventId: string) => getEventBookings(eventId).reduce((sum, b) => sum + b.price, 0),
    [getEventBookings]
  )

  return (
    <BookingContext.Provider
      value={{
        bookings,
        events,
        mounted,
        dataError,
        addBooking,
        cancelBooking,
        updateBookingStatus,
        isSlotBooked,
        addEvent,
        getEvent,
        getEventBookings,
        eventBudgetUsed,
        reload,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error("useBookings must be used within BookingProvider")
  return ctx
}

/** Total USD des réservations d'une cérémonie + estimation FC */
export function serviceTotalForEvent(bookings: Booking[], eventId: string) {
  return bookings
    .filter((b) => b.eventId === eventId && b.status !== "cancelled")
    .reduce((sum, b) => sum + b.price, 0)
}

export type { Service }
