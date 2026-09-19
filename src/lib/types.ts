export interface Provider {
  name: string
  avatar: string
  verified: boolean
  experience: string
  rating: number
}

export type AdminApprovalStatus = "approved" | "pending" | "rejected"
export type ProviderStatus = "approved" | "pending" | "suspended"

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
  paused?: boolean // mis en pause par le prestataire (invisible côté clients)
  custom?: boolean // prestation créée depuis l'espace prestataires
  adminApprovalStatus?: AdminApprovalStatus // statut de modération admin
  adminFeedback?: string // commentaire éventuel de l'admin
  isDeleted?: boolean // supprimé par l'admin
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
  // --- Routage du paiement (instantané au moment de la réservation) ---
  providerPayoutMethod?: string // canal du compte de réception du prestataire
  providerPayoutNumber?: string // numéro / compte de réception du prestataire
  // --- Commission interne : ne jamais afficher dans l'interface ---
  platformFeeUSD?: number // part plateforme (4 %) prélevée sur le paiement
  providerNetUSD?: number // part nette (96 %) revenant au prestataire
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

/** Modifications faites par un prestataire ou par l'admin sur une prestation */
export interface ServiceOverride {
  price?: number // nouveau prix USD
  paused?: boolean // prestation en pause (masquée du catalogue client)
  instant?: boolean // réservation instantanée activée/désactivée
  name?: string
  category?: string
  city?: string
  location?: string
  description?: string
  adminApprovalStatus?: AdminApprovalStatus
  adminFeedback?: string
  isDeleted?: boolean
}

/** Profil éditable d'un prestataire (coordonnées + retraits Mobile Money) */
export interface ProviderProfileData {
  phone?: string
  whatsapp?: string
  email?: string
  bio?: string
  payoutMethod?: string // "M-Pesa" | "Orange Money" | "Airtel Money"
  payoutNumber?: string
}

/** Compte officiel d'un prestataire enregistré sur Smart Booking */
export interface ProviderAccount {
  id: string
  name: string // Raison sociale / Nom commercial
  contactPerson: string
  phone: string
  whatsapp: string
  email: string
  city: string
  location: string
  category: string
  experience: string
  bio: string
  rccm?: string
  idNat?: string
  status: ProviderStatus
  rating: number
  reviewsCount: number
  verified: boolean
  avatar: string
  registeredAt: string
  adminNotes?: string
  payoutMethod?: string // canal de retrait Mobile Money préféré
  payoutNumber?: string // numéro Mobile Money de retrait
}

/** Élément du panier multi-prestations client */
export interface CartItem {
  id: string
  serviceId: string
  service: Service
  date: string // yyyy-MM-dd
  time: string // HH:mm
  notes?: string
}

/** Données pour devis officiel et facture */
export interface QuoteData {
  quoteNumber: string
  date: string
  validUntil: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  ceremonyType?: string
  ceremonyDate?: string
  city?: string
  items: CartItem[]
  subtotal: number // USD
  discount: number // USD
  total: number // USD
  deposit: number // USD
  balance: number // USD
  notes?: string
}

/** Message dans les fils de discussion (Client <-> Prestataire et Prestataire <-> Admin) */
export interface ChatMessage {
  id: string
  threadId: string
  fromRole: "client" | "provider" | "admin"
  fromName: string
  toRole: "client" | "provider" | "admin"
  toName: string
  content: string
  createdAt: string
  bookingId?: string
  serviceId?: string
  read?: boolean
}

/** Demande de retrait Mobile Money par un prestataire */
export interface PayoutRequest {
  id: string
  providerName: string
  amountUSD: number
  amountFC: number
  method: "M-Pesa" | "Orange Money" | "Airtel Money"
  phoneNumber: string
  status: "pending" | "processing" | "processed" | "paid" | "rejected"
  requestedAt: string
  processedAt?: string
  transactionRef?: string
  notes?: string
  adminNotes?: string
}

/** Journal d'activité de la plateforme pour l'administration */
export interface ActivityLogItem {
  id: string
  type: "provider_register" | "service_submit" | "service_approve" | "service_reject" | "booking_created" | "payout_request"
  title: string
  description: string
  timestamp: string
}

/** Thèmes pour le générateur d'affiches */
export type FlyerTheme = "gold" | "dark" | "rose" | "emerald"

export type BookingStatus = Booking["status"]
