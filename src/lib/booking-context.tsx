"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Booking } from "./types"

type BookingContextType = {
  bookings: Booking[]
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'status'>) => Booking
  cancelBooking: (id: string) => void
  getBookingsByService: (serviceId: string) => Booking[]
  isSlotBooked: (date: string, time: string, serviceId: string) => boolean
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('smart-bookings-rdc')
    if (saved) {
      try {
        setBookings(JSON.parse(saved))
      } catch {}
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('smart-bookings-rdc', JSON.stringify(bookings))
    }
  }, [bookings, mounted])

  const addBooking = (data: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: Booking = {
      ...data,
      id: Math.random().toString(36).slice(2, 9),
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    }
    setBookings(prev => [newBooking, ...prev])
    return newBooking
  }

  const cancelBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b))
  }

  const getBookingsByService = (serviceId: string) => {
    return bookings.filter(b => b.serviceId === serviceId && b.status !== 'cancelled')
  }

  const isSlotBooked = (date: string, time: string, serviceId: string) => {
    return bookings.some(b => b.date === date && b.time === time && b.serviceId === serviceId && b.status !== 'cancelled')
  }

  return (
    <BookingContext.Provider value={{ bookings, addBooking, cancelBooking, getBookingsByService, isSlotBooked }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBookings must be used within BookingProvider')
  return ctx
}
