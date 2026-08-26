export interface Service {
  id: string
  name: string
  category: string
  description: string
  longDescription: string
  duration: number // minutes
  price: number
  rating: number
  reviews: number
  image: string
  images: string[]
  provider: {
    name: string
    avatar: string
    verified: boolean
    experience: string
  }
  location: string
  features: string[]
  popular?: boolean
  instant?: boolean
}

export interface Booking {
  id: string
  serviceId: string
  serviceName: string
  serviceImage: string
  date: string // ISO date
  time: string
  duration: number
  price: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  customerName: string
  customerEmail: string
  providerName: string
  location: string
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
