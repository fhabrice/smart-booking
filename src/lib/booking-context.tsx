"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Booking, CeremonyEvent, Service } from "./types"
import { syncBookingCreation, syncBookingStatus, syncEventCreation } from "./supabase/sync"

type NewBooking = Omit<Booking, "id" | "createdAt" | "status"> & { status?: Booking["status"] }

type BookingContextType = {
  bookings: Booking[]
  events: CeremonyEvent[]
  mounted: boolean
  addBooking: (booking: NewBooking) => Booking
  cancelBooking: (id: string) => void
  updateBookingStatus: (id: string, status: Booking["status"]) => void
  isSlotBooked: (date: string, time: string, serviceId: string) => boolean
  addEvent: (event: Omit<CeremonyEvent, "id" | "createdAt">) => CeremonyEvent
  getEvent: (id: string) => CeremonyEvent | undefined
  getEventBookings: (eventId: string) => Booking[]
  eventBudgetUsed: (eventId: string) => number
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

const BOOKINGS_KEY = "sb-rdc-bookings"
const EVENTS_KEY = "sb-rdc-events"

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [events, setEvents] = useState<CeremonyEvent[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const savedBookings = localStorage.getItem(BOOKINGS_KEY)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (savedBookings) setBookings(JSON.parse(savedBookings))
      const savedEvents = localStorage.getItem(EVENTS_KEY)
      if (savedEvents) setEvents(JSON.parse(savedEvents))
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
  }, [bookings, mounted])

  useEffect(() => {
    if (mounted) localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
  }, [events, mounted])

  const addBooking = (data: NewBooking) => {
    const newBooking: Booking = {
      ...data,
      id: Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
      status: data.status ?? "confirmed",
    }
    setBookings((prev) => [newBooking, ...prev])
    // Miroir Supabase (no-op si la base n'est pas configurée)
    syncBookingCreation(newBooking)
    return newBooking
  }

  const cancelBooking = (id: string) => {
    syncBookingStatus(id, "cancelled")
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as const } : b)))
  }

  const updateBookingStatus = (id: string, status: Booking["status"]) => {
    syncBookingStatus(id, status)
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  const isSlotBooked = (date: string, time: string, serviceId: string) => {
    return bookings.some(
      (b) => b.date === date && b.time === time && b.serviceId === serviceId && b.status !== "cancelled"
    )
  }

  const addEvent = (data: Omit<CeremonyEvent, "id" | "createdAt">) => {
    const newEvent: CeremonyEvent = {
      ...data,
      id: Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
    }
    setEvents((prev) => [newEvent, ...prev])
    syncEventCreation(newEvent)
    return newEvent
  }

  const getEvent = (id: string) => events.find((e) => e.id === id)

  const getEventBookings = (eventId: string) =>
    bookings.filter((b) => b.eventId === eventId && b.status !== "cancelled")

  const eventBudgetUsed = (eventId: string) =>
    getEventBookings(eventId).reduce((sum, b) => sum + b.price, 0)

  return (
    <BookingContext.Provider
      value={{
        bookings,
        events,
        mounted,
        addBooking,
        cancelBooking,
        updateBookingStatus,
        isSlotBooked,
        addEvent,
        getEvent,
        getEventBookings,
        eventBudgetUsed,
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
