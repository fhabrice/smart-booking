import { getSupabase } from "./client"
import type {
  Booking,
  CeremonyEvent,
  ChatMessage,
  PayoutRequest,
  ProviderAccount,
  QuoteData,
  Service,
} from "../types"

/**
 * Couche d'accès aux données Supabase — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * Chaque fonction retourne `null` quand Supabase n'est pas configuré ou
 * lorsqu'une erreur réseau survient : l'app retombe alors sur sa persistance
 * locale (`localStorage`) sans interrompre le parcours utilisateur.
 *
 * Les noms de tables / colonnes correspondent exactement à `supabase-schema.sql`.
 */

/**
 * Résultat d'un appel Supabase : les données attendues, ou `null` lorsque la
 * base n'est pas configurée / qu'une erreur est survenue (l'app bascule alors
 * sur sa persistance locale).
 */
type Result<T> = Promise<T | null>

// ---------------------------------------------------------------------------
// Prestations (vitrine publique)
// ---------------------------------------------------------------------------

/** Prestations approuvées, non supprimées, non en pause (vue `services_public`). */
export async function fetchPublicServices(): Result<Service[]> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("services")
    .select("*")
    .eq("admin_approval_status", "approved")
    .eq("is_deleted", false)
    .eq("paused", false)
    .order("created_at", { ascending: false })
  if (error) {
    console.warn("[supabase] fetchPublicServices:", error.message)
    return null
  }
  return (data ?? []).map(rowToService)
}

/** Prestations d'un prestataire (toutes statuts confondus). */
export async function fetchProviderServices(providerName: string): Result<Service[]> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("services")
    .select("*")
    .ilike("provider_name", providerName)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
  if (error) {
    console.warn("[supabase] fetchProviderServices:", error.message)
    return null
  }
  return (data ?? []).map(rowToService)
}

/** Publication d'une prestation → statut `pending` (validation admin requise). */
export async function insertService(
  service: Service & { id?: string; providerId?: string }
): Result<string> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("services")
    .insert({
      id: service.id ?? undefined,
      provider_id: service.providerId ?? null,
      provider_name: service.provider.name,
      name: service.name,
      category: service.category,
      description: service.description,
      long_description: service.longDescription,
      price: service.price,
      price_unit: service.priceUnit,
      duration: service.duration,
      rating: service.rating,
      reviews: service.reviews,
      image: service.image,
      images: service.images ?? [],
      city: service.city,
      location: service.location,
      features: service.features ?? [],
      popular: service.popular ?? false,
      instant: service.instant ?? false,
      paused: service.paused ?? false,
      is_custom: service.custom ?? true,
      admin_approval_status: service.adminApprovalStatus ?? "pending",
    })
    .select("id")
    .single()
  if (error) {
    console.warn("[supabase] insertService:", error.message)
    return null
  }
  return data?.id ?? null
}

/** Modération admin : approuver / rejeter une prestation. */
export async function setServiceApproval(
  serviceId: string,
  status: "approved" | "rejected",
  feedback?: string
): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  const { error } = await sb
    .from("services")
    .update({ admin_approval_status: status, admin_feedback: feedback ?? null })
    .eq("id", serviceId)
  if (error) console.warn("[supabase] setServiceApproval:", error.message)
  return !error
}

// ---------------------------------------------------------------------------
// Prestataires (inscription obligatoire avant connexion)
// ---------------------------------------------------------------------------

export async function fetchProviders(): Result<ProviderAccount[]> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("providers")
    .select("*")
    .order("registered_at", { ascending: false })
  if (error) {
    console.warn("[supabase] fetchProviders:", error.message)
    return null
  }
  return (data ?? []).map(rowToProvider)
}

/** Nouvelle inscription prestataire → statut `pending` (à approuver par l'admin). */
export async function insertProvider(
  account: Partial<ProviderAccount> & { name: string; contactPerson: string; phone: string }
): Result<string> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("providers")
    .insert({
      id: account.id ?? undefined,
      name: account.name,
      contact_person: account.contactPerson,
      phone: account.phone,
      whatsapp: account.whatsapp,
      email: account.email,
      city: account.city,
      location: account.location,
      category: account.category,
      experience: account.experience,
      bio: account.bio,
      rccm: account.rccm ?? null,
      id_nat: account.idNat ?? null,
      status: account.status ?? "pending",
      verified: account.verified ?? false,
      avatar: account.avatar ?? null,
      payout_method: account.payoutMethod ?? null,
      payout_number: account.payoutNumber ?? null,
    })
    .select("id")
    .single()
  if (error) {
    console.warn("[supabase] insertProvider:", error.message)
    return null
  }
  return data?.id ?? null
}

/** Validation / suspension d'un compte prestataire par l'admin. */
export async function setProviderStatus(
  providerId: string,
  status: "pending" | "approved" | "suspended",
  adminNotes?: string
): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  const { error } = await sb
    .from("providers")
    .update({
      status,
      verified: status === "approved",
      admin_notes: adminNotes ?? null,
    })
    .eq("id", providerId)
  if (error) console.warn("[supabase] setProviderStatus:", error.message)
  return !error
}

// ---------------------------------------------------------------------------
// Réservations
// ---------------------------------------------------------------------------

export async function fetchBookings(): Result<Booking[]> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.warn("[supabase] fetchBookings:", error.message)
    return null
  }
  return (data ?? []).map(rowToBooking)
}

export async function insertBooking(
  booking: Omit<Booking, "id" | "createdAt"> & { id?: string }
): Result<string> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("bookings")
    .insert({
      id: booking.id ?? undefined,
      event_id: booking.eventId ?? null,
      service_id: booking.serviceId ?? null,
      provider_name: booking.providerName,
      service_name: booking.serviceName,
      service_image: booking.serviceImage,
      service_category: booking.serviceCategory,
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      price: booking.price,
      deposit: booking.deposit,
      payment_method: booking.paymentMethod,
      status: booking.status,
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      customer_email: booking.customerEmail ?? null,
      location: booking.location,
      city: booking.city,
    })
    .select("id")
    .single()
  if (error) {
    console.warn("[supabase] insertBooking:", error.message)
    return null
  }
  return data?.id ?? null
}

export async function setBookingStatus(
  bookingId: string,
  status: Booking["status"]
): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  const { error } = await sb.from("bookings").update({ status }).eq("id", bookingId)
  if (error) console.warn("[supabase] setBookingStatus:", error.message)
  return !error
}

// ---------------------------------------------------------------------------
// Cérémonies créées par les clients
// ---------------------------------------------------------------------------

export async function insertEvent(event: CeremonyEvent): Result<string> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("ceremony_events")
    .insert({
      id: event.id,
      type: event.type,
      title: event.title,
      date: event.date,
      time: event.time,
      city: event.city,
      venue: event.venue,
      guests: event.guests,
      budget: event.budget,
      notes: event.notes ?? null,
    })
    .select("id")
    .single()
  if (error) {
    console.warn("[supabase] insertEvent:", error.message)
    return null
  }
  return data?.id ?? null
}

// ---------------------------------------------------------------------------
// Devis pro-forma & factures d'acompte
// ---------------------------------------------------------------------------

export async function insertQuote(
  quote: Omit<QuoteData, "quoteNumber"> & { quoteNumber: string; paymentMethod?: string }
): Result<string> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("quotes")
    .insert({
      quote_number: quote.quoteNumber,
      kind: "devis",
      customer_name: quote.customerName,
      customer_phone: quote.customerPhone,
      customer_email: quote.customerEmail ?? null,
      ceremony_type: quote.ceremonyType ?? null,
      ceremony_date: quote.ceremonyDate ?? null,
      city: quote.city ?? null,
      items: JSON.stringify(
        quote.items.map((i) => ({
          serviceId: i.serviceId,
          name: i.service.name,
          price: i.service.price,
          priceUnit: i.service.priceUnit,
          date: i.date,
          time: i.time,
          provider: i.service.provider.name,
        }))
      ),
      subtotal: quote.subtotal,
      discount: quote.discount,
      total: quote.total,
      deposit: quote.deposit,
      balance: quote.balance,
      payment_method: quote.paymentMethod ?? "M-Pesa",
      notes: quote.notes ?? null,
      date: quote.date,
      valid_until: quote.validUntil,
    })
    .select("id")
    .single()
  if (error) {
    console.warn("[supabase] insertQuote:", error.message)
    return null
  }
  return data?.id ?? null
}

// ---------------------------------------------------------------------------
// Messagerie (client ↔ prestataire ↔ admin)
// ---------------------------------------------------------------------------

export async function fetchThread(threadId: string): Result<ChatMessage[]> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
  if (error) {
    console.warn("[supabase] fetchThread:", error.message)
    return null
  }
  return (data ?? []).map(rowToMessage)
}

export async function insertMessage(
  message: Omit<ChatMessage, "id" | "createdAt"> & { id?: string }
): Result<string> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("messages")
    .insert({
      id: message.id ?? undefined,
      thread_id: message.threadId,
      from_role: message.fromRole,
      from_name: message.fromName,
      to_role: message.toRole,
      to_name: message.toName,
      content: message.content,
      booking_id: message.bookingId ?? null,
      service_id: message.serviceId ?? null,
      read: message.read ?? false,
    })
    .select("id")
    .single()
  if (error) {
    console.warn("[supabase] insertMessage:", error.message)
    return null
  }
  return data?.id ?? null
}

// ---------------------------------------------------------------------------
// Retraits Mobile Money (M-Pesa, Orange Money, Airtel Money)
// ---------------------------------------------------------------------------

export async function fetchPayouts(): Result<PayoutRequest[]> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("payout_requests")
    .select("*")
    .order("requested_at", { ascending: false })
  if (error) {
    console.warn("[supabase] fetchPayouts:", error.message)
    return null
  }
  return (data ?? []).map(rowToPayout)
}

export async function insertPayout(
  payout: Omit<PayoutRequest, "requestedAt" | "status"> & { requestedAt?: string; status?: string }
): Result<string> {
  const sb = getSupabase()
  if (!sb) return null
  const { data, error } = await sb
    .from("payout_requests")
    .insert({
      id: payout.id ?? undefined,
      provider_name: payout.providerName,
      amount_usd: payout.amountUSD,
      amount_fc: payout.amountFC,
      method: payout.method,
      phone_number: payout.phoneNumber,
      status: "pending",
      notes: payout.notes ?? null,
    })
    .select("id")
    .single()
  if (error) {
    console.warn("[supabase] insertPayout:", error.message)
    return null
  }
  return data?.id ?? null
}

/** Validation d'un retrait par l'admin (référence opérateur Mobile Money). */
export async function processPayout(payoutId: string, transactionRef: string): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  const { error } = await sb
    .from("payout_requests")
    .update({
      status: "paid",
      transaction_ref: transactionRef,
      processed_at: new Date().toISOString(),
    })
    .eq("id", payoutId)
  if (error) console.warn("[supabase] processPayout:", error.message)
  return !error
}

// ---------------------------------------------------------------------------
// Mappers ligne SQL → types TypeScript de l'application
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

export function rowToService(row: Row): Service {
  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    description: row.description ?? "",
    longDescription: row.long_description ?? "",
    price: Number(row.price ?? 0),
    priceUnit: row.price_unit ?? "la prestation",
    duration: Number(row.duration ?? 240),
    rating: Number(row.rating ?? 5),
    reviews: Number(row.reviews ?? 0),
    image: row.image ?? "",
    images: row.images ?? [],
    provider: {
      name: row.provider_name ?? "",
      avatar: row.provider_avatar ?? "/images/avatar-1.jpg",
      verified: row.provider_verified ?? true,
      experience: row.provider_experience ?? "",
      rating: Number(row.rating ?? 5),
    },
    city: row.city ?? "",
    location: row.location ?? "",
    features: row.features ?? [],
    popular: row.popular ?? false,
    instant: row.instant ?? false,
    paused: row.paused ?? false,
    custom: row.is_custom ?? false,
    adminApprovalStatus: row.admin_approval_status ?? "pending",
    adminFeedback: row.admin_feedback ?? undefined,
    isDeleted: row.is_deleted ?? false,
  }
}

export function rowToProvider(row: Row): ProviderAccount {
  return {
    id: String(row.id),
    name: row.name,
    contactPerson: row.contact_person ?? "",
    phone: row.phone ?? "",
    whatsapp: row.whatsapp ?? "",
    email: row.email ?? "",
    city: row.city ?? "",
    location: row.location ?? "",
    category: row.category ?? "",
    experience: row.experience ?? "",
    bio: row.bio ?? "",
    rccm: row.rccm ?? undefined,
    idNat: row.id_nat ?? undefined,
    status: row.status ?? "pending",
    rating: Number(row.rating ?? 5),
    reviewsCount: Number(row.reviews_count ?? 0),
    verified: row.verified ?? false,
    avatar: row.avatar ?? "/images/avatar-1.jpg",
    registeredAt: row.registered_at ?? new Date().toISOString(),
    adminNotes: row.admin_notes ?? undefined,
    payoutMethod: row.payout_method ?? undefined,
    payoutNumber: row.payout_number ?? undefined,
  }
}

export function rowToBooking(row: Row): Booking {
  return {
    id: String(row.id),
    eventId: row.event_id ?? undefined,
    serviceId: row.service_id ?? "",
    serviceName: row.service_name ?? "",
    serviceImage: row.service_image ?? "",
    serviceCategory: row.service_category ?? "",
    date: row.date,
    time: String(row.time ?? "10:00").slice(0, 5),
    duration: Number(row.duration ?? 240),
    price: Number(row.price ?? 0),
    deposit: Number(row.deposit ?? 0),
    paymentMethod: row.payment_method ?? "M-Pesa",
    status: row.status ?? "pending",
    customerName: row.customer_name ?? "",
    customerPhone: row.customer_phone ?? "",
    customerEmail: row.customer_email ?? undefined,
    providerName: row.provider_name ?? "",
    location: row.location ?? "",
    city: row.city ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
  }
}

export function rowToMessage(row: Row): ChatMessage {
  return {
    id: String(row.id),
    threadId: row.thread_id,
    fromRole: row.from_role,
    fromName: row.from_name,
    toRole: row.to_role,
    toName: row.to_name,
    content: row.content,
    createdAt: row.created_at,
    bookingId: row.booking_id ?? undefined,
    serviceId: row.service_id ?? undefined,
    read: row.read ?? false,
  }
}

export function rowToPayout(row: Row): PayoutRequest {
  return {
    id: String(row.id),
    providerName: row.provider_name,
    amountUSD: Number(row.amount_usd ?? 0),
    amountFC: Number(row.amount_fc ?? 0),
    method: row.method ?? "M-Pesa",
    phoneNumber: row.phone_number ?? "",
    status: row.status ?? "pending",
    requestedAt: row.requested_at ?? new Date().toISOString(),
    processedAt: row.processed_at ?? undefined,
    transactionRef: row.transaction_ref ?? undefined,
    notes: row.notes ?? undefined,
    adminNotes: row.admin_notes ?? undefined,
  }
}
