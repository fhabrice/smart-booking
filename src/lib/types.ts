export interface Provider {
  name: string
  avatar: string
  verified: boolean
  experience: string
  rating: number
}

export interface Service {
  id: string
  name: string
  category: string // id de catégorie
  description: string
  longDescription: string
  price: number // en USD
  priceUnit: string // "la prestation" | "par invité" | "par jour" | "l'événement"
  duration: number // durée sur place en minutes
  rating: number
  reviews: number
  image: string
  images: string[]
  provider: Provider
  city: string
  location: string // commune / quartier
  features: string[]
  popular?: boolean
  instant?: boolean
}

export type Currency = "USD" | "FC"

export interface CeremonyEvent {
  id: string
  type: string // id du type de cérémonie
  title: string
  date: string // ISO yyyy-MM-dd
  time: string
  city: string
  venue: string
  guests: number
  budget: number // USD, 0 = non défini
  notes?: string
  createdAt: string
}

export interface Booking {
  id: string
  eventId?: string // cérémonie rattachée (optionnel)
  serviceId: string
  serviceName: string
  serviceImage: string
  serviceCategory: string
  date: string // ISO yyyy-MM-dd
  time: string
  duration: number
  price: number // total USD
  deposit: number // acompte payé USD
  paymentMethod: string // "M-Pesa" | "Orange Money" | "Airtel Money"
  status: "confirmed" | "pending" | "cancelled" | "completed"
  customerName: string
  customerPhone: string
  customerEmail?: string
  providerName: string
  location: string
  city: string
  createdAt: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export type Category = {
  id: string
  name: string
  icon: string
  count: number
}

export type EventType = {
  id: string
  label: string
  icon: string
  desc: string
}

export type City = {
  id: string
  name: string
  province: string
}

export type ChecklistItem = {
  category: string
  label: string
}
