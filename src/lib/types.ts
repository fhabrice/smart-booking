export interface Service {
  id: string
  name: string
  category: string
  province: string
  city: string
  description: string
  longDescription: string
  capacity?: string
  price: number
  priceUnit: string // ex: "/ jour", "/ événement"
  rating: number
  reviews: number
  image: string
  images: string[]
  provider: {
    id: string
    name: string
    avatar: string
    verified: boolean
    adminApproved: boolean
    experience: string
    phone: string
    servicesCount: number
  }
  location: string
  features: string[]
  popular?: boolean
  instant?: boolean
  eventTypes: string[] // mariage, conférence, etc.
}

export interface Booking {
  id: string
  serviceId: string
  serviceName: string
  serviceImage: string
  category: string
  province: string
  city: string
  date: string // ISO date
  time: string
  eventType: string
  guests: number
  duration: number
  price: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'awaiting_admin'
  customerName: string
  customerPhone: string
  customerEmail?: string
  providerName: string
  providerPhone: string
  location: string
  createdAt: string
  notes?: string
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
  description: string
}

export type Province = {
  id: string
  name: string
  capital: string
  count: number
}

export type EventType = {
  id: string
  name: string
  icon: string
}
