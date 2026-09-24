import { getSupabaseAdmin } from "./supabase"
import type {
  Booking,
  CartItem,
  CeremonyEvent,
  ChatMessage,
  PayoutRequest,
  ProviderAccount,
  QuoteData,
  Service,
} from "../types"

/**
 * Couche d'accès aux données — Smart Booking RDC 🇨🇩 (SERVEUR UNIQUEMENT)
 * ---------------------------------------------------------------------------
 * Toutes les données de l'application proviennent de la base Supabase
 * (PostgreSQL). Ce module n'est appelé que par les Route Handlers `/api/*`,
 * avec la clé `service_role` (jamais exposée au navigateur).
 *
 * Les noms de tables / colonnes correspondent exactement à
 * `supabase-schema.sql` (+ `migration-paiement-direct.sql`).
 */

export class DbError extends Error {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

function fail(label: string, message?: string): never {
  console.warn(`[db] ${label}:`, message)
  if (message && /fetch failed|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET|EAI_AGAIN/i.test(message)) {
    throw new DbError(
      "Base de données injoignable — vérifiez SUPABASE_URL et la connectivité réseau du serveur."
    )
  }
  throw new DbError(message || `Erreur base de données (${label})`)
}

// ===========================================================================
//  MAPPERS ligne SQL → types TypeScript
// ===========================================================================

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
      verified: row.provider_verified ?? false,
      experience: row.provider_experience ?? "",
      rating: Number(row.provider_rating ?? row.rating ?? 5),
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
    date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
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
    providerPayoutMethod: row.provider_payout_method ?? undefined,
    providerPayoutNumber: row.provider_payout_number ?? undefined,
    platformFeeUSD: row.platform_fee != null ? Number(row.platform_fee) : undefined,
    providerNetUSD: row.provider_net != null ? Number(row.provider_net) : undefined,
  }
}

export function rowToEvent(row: Row): CeremonyEvent {
  return {
    id: String(row.id),
    type: row.type,
    title: row.title,
    date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
    time: String(row.time ?? "10:00").slice(0, 5),
    city: row.city ?? "",
    venue: row.venue ?? "",
    guests: Number(row.guests ?? 100),
    budget: Number(row.budget ?? 0),
    notes: row.notes ?? undefined,
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

// ===========================================================================
//  PRESTATIONS (services)
// ===========================================================================

/** Vitrine publique : approuvées, non supprimées, non en pause, prestataire non suspendu. */
export async function dbListPublicServices(): Promise<Service[]> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("listPublicServices", "client indisponible")
  const [{ data, error }, { data: suspended }] = await Promise.all([
    sb!
      .from("services")
      .select("*")
      .eq("admin_approval_status", "approved")
      .eq("is_deleted", false)
      .eq("paused", false)
      .order("created_at", { ascending: false }),
    sb!.from("providers").select("id,name").eq("status", "suspended"),
  ])
  if (error) fail("listPublicServices", error.message)
  const suspendedIds = new Set((suspended ?? []).map((p: Row) => String(p.id)))
  const suspendedNames = new Set((suspended ?? []).map((p: Row) => String(p.name).toLowerCase()))
  return (data ?? [])
    // Le filtrage par identifiant est le plus fiable : contrairement au nom, il
    // ne peut pas se désynchroniser (renommage, correction manuelle en base).
    .filter((row: Row) => !(row.provider_id && suspendedIds.has(String(row.provider_id))))
    .map(rowToService)
    .filter((s) => !suspendedNames.has(s.provider.name.toLowerCase()))
}

/** Toutes les prestations (tous statuts, suppressions logiques incluses) — admin. */
export async function dbListAllServices(): Promise<Service[]> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("listAllServices", "client indisponible")
  const { data, error } = await sb.from("services").select("*").order("created_at", { ascending: false })
  if (error) fail("listAllServices", error.message)
  return (data ?? []).map(rowToService)
}

/** Prestations d'un prestataire (hors suppressions logiques). */
export async function dbListProviderServices(providerName: string): Promise<Service[]> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("listProviderServices", "client indisponible")
  const { data, error } = await sb
    .from("services")
    .select("*")
    .ilike("provider_name", providerName)
    .eq("is_deleted", false)
    .order("created_at", { ascending: false })
  if (error) fail("listProviderServices", error.message)
  return (data ?? []).map(rowToService)
}

export async function dbGetService(id: string): Promise<Service | null> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("getService", "client indisponible")
  const { data, error } = await sb.from("services").select("*").eq("id", id).maybeSingle()
  if (error) fail("getService", error.message)
  return data ? rowToService(data) : null
}

export type ServiceInsert = Omit<Service, "id"> & { id?: string; providerId?: string }

export async function dbCreateService(service: ServiceInsert): Promise<Service> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("createService", "client indisponible")
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
    .select("*")
    .single()
  if (error) fail("createService", error.message)
  return rowToService(data)
}

/** Champs modifiables d'une prestation (camelCase → colonnes SQL). */
export type ServicePatch = Partial<{
  name: string
  category: string
  description: string
  longDescription: string
  price: number
  priceUnit: string
  duration: number
  image: string
  images: string[]
  city: string
  location: string
  features: string[]
  popular: boolean
  instant: boolean
  paused: boolean
  adminApprovalStatus: "pending" | "approved" | "rejected"
  adminFeedback: string | null
  isDeleted: boolean
}>

export async function dbUpdateService(id: string, patch: ServicePatch): Promise<Service> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("updateService", "client indisponible")
  const update: Row = {}
  if (patch.name !== undefined) update.name = patch.name
  if (patch.category !== undefined) update.category = patch.category
  if (patch.description !== undefined) update.description = patch.description
  if (patch.longDescription !== undefined) update.long_description = patch.longDescription
  if (patch.price !== undefined) update.price = patch.price
  if (patch.priceUnit !== undefined) update.price_unit = patch.priceUnit
  if (patch.duration !== undefined) update.duration = patch.duration
  if (patch.image !== undefined) update.image = patch.image
  if (patch.images !== undefined) update.images = patch.images
  if (patch.city !== undefined) update.city = patch.city
  if (patch.location !== undefined) update.location = patch.location
  if (patch.features !== undefined) update.features = patch.features
  if (patch.popular !== undefined) update.popular = patch.popular
  if (patch.instant !== undefined) update.instant = patch.instant
  if (patch.paused !== undefined) update.paused = patch.paused
  if (patch.adminApprovalStatus !== undefined) update.admin_approval_status = patch.adminApprovalStatus
  if (patch.adminFeedback !== undefined) update.admin_feedback = patch.adminFeedback
  if (patch.isDeleted !== undefined) update.is_deleted = patch.isDeleted
  const { data, error } = await sb.from("services").update(update).eq("id", id).select("*").maybeSingle()
  if (error) fail("updateService", error.message)
  if (!data) throw new DbError("Prestation introuvable.")
  return rowToService(data)
}

/** Suppression définitive d'une prestation (le prestataire retire sa propre publication). */
export async function dbDeleteService(id: string): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("deleteService", "client indisponible")
  const { error } = await sb.from("services").delete().eq("id", id)
  if (error) fail("deleteService", error.message)
}

// ===========================================================================
//  PRESTATAIRES (providers)
// ===========================================================================

export async function dbListProviders(): Promise<ProviderAccount[]> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("listProviders", "client indisponible")
  const { data, error } = await sb.from("providers").select("*").order("registered_at", { ascending: false })
  if (error) fail("listProviders", error.message)
  return (data ?? []).map(rowToProvider)
}

export async function dbGetProviderByName(name: string): Promise<ProviderAccount | null> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("getProviderByName", "client indisponible")
  const { data, error } = await sb.from("providers").select("*").ilike("name", name).maybeSingle()
  if (error) fail("getProviderByName", error.message)
  return data ? rowToProvider(data) : null
}

export type ProviderInsert = Partial<ProviderAccount> & {
  name: string
  contactPerson: string
  phone: string
}

export async function dbCreateProvider(account: ProviderInsert): Promise<ProviderAccount> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("createProvider", "client indisponible")
  const { data, error } = await sb
    .from("providers")
    .insert({
      name: account.name,
      contact_person: account.contactPerson,
      phone: account.phone,
      whatsapp: account.whatsapp ?? null,
      email: account.email ?? null,
      city: account.city ?? "Kinshasa",
      location: account.location ?? null,
      category: account.category ?? "salles",
      experience: account.experience ?? null,
      bio: account.bio ?? null,
      rccm: account.rccm ?? null,
      id_nat: account.idNat ?? null,
      status: "pending", // toute nouvelle inscription passe par la validation admin
      verified: false,
      avatar: account.avatar ?? null,
      payout_method: account.payoutMethod ?? null,
      payout_number: account.payoutNumber ?? null,
    })
    .select("*")
    .single()
  if (error) {
    if (error.code === "23505") throw new DbError("Un compte avec ce nom d'établissement existe déjà.")
    fail("createProvider", error.message)
  }
  return rowToProvider(data)
}

export type ProviderPatch = Partial<{
  name: string
  contactPerson: string
  phone: string
  whatsapp: string
  email: string
  city: string
  location: string
  category: string
  experience: string
  bio: string
  rccm: string | null
  idNat: string | null
  status: "pending" | "approved" | "suspended"
  verified: boolean
  avatar: string
  adminNotes: string | null
  payoutMethod: string | null
  payoutNumber: string | null
}>

/**
 * Identifiant d'un compte prestataire à partir de son nom commercial.
 * L'identifiant, contrairement au nom, résiste aux renommages : on le stocke
 * donc sur les réservations et les retraits pour que ces données restent
 * rattachées au bon compte même après une correction de nom.
 */
async function dbResolveProviderId(providerName: string): Promise<string | null> {
  const sb = getSupabaseAdmin()
  if (!sb || !providerName.trim()) return null
  const { data } = await sb.from("providers").select("id").ilike("name", providerName).maybeSingle()
  return data ? String((data as Row).id) : null
}

/**
 * Propage un renommage de compte prestataire aux copies dénormalisées du nom.
 *
 * Sans cette propagation, renommer un compte (action prévue dans
 * `/admin/providers`) casse l'espace du prestataire : l'espace prestataire,
 * son agenda et ses retraits sont indexés par nom, il ne retrouverait donc
 * plus rien. Pire, la suspension d'un compte cesse de masquer ses prestations
 * dans la vitrine, puisque ce filtrage comparait les noms.
 */
async function dbPropagateProviderRename(
  providerId: string,
  previousName: string,
  newName: string,
): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) return

  const services = await sb
    .from("services")
    .update({ provider_name: newName })
    .eq("provider_id", providerId)
  if (services.error) fail("renameProvider", `services : ${services.error.message}`)

  const payouts = await sb
    .from("payout_requests")
    .update({ provider_name: newName })
    .eq("provider_id", providerId)
  if (payouts.error) fail("renameProvider", `payout_requests : ${payouts.error.message}`)

  // Les réservations antérieures ne stockaient pas l'identifiant : on les
  // rattache d'abord via l'ancien nom, puis on les renomme par identifiant.
  const backfill = await sb
    .from("bookings")
    .update({ provider_id: providerId })
    .ilike("provider_name", previousName)
    .is("provider_id", null)
  if (backfill.error) fail("renameProvider", `bookings (rattachement) : ${backfill.error.message}`)

  const bookings = await sb
    .from("bookings")
    .update({ provider_name: newName })
    .eq("provider_id", providerId)
  if (bookings.error) fail("renameProvider", `bookings : ${bookings.error.message}`)

  // Fils de discussion : l'interface reconstruit leur identifiant à partir du
  // nom courant (`admin-<prestataire>` pour l'assistance, `cp-<prestataire>-
  // <téléphone>` pour les échanges client). Sans réécriture, historique client
  // et assistance deviendraient invisibles des deux côtés.
  // On filtre par `like` paramétré (et non par une chaîne `or=` brute) pour ne
  // pas casser sur les noms contenant des caractères réservés par PostgREST.
  const renaming: Array<[string, string]> = [
    [`admin-${previousName}`, `admin-${newName}`],
    [`cp-${previousName}-`, `cp-${newName}-`],
  ]
  for (const [oldPrefix, newPrefix] of renaming) {
    const { data: rows, error: readError } = await sb
      .from("messages")
      .select("id,thread_id")
      .like("thread_id", `${oldPrefix}%`)
    if (readError) fail("renameProvider", `messages : ${readError.message}`)
    for (const row of (rows ?? []) as Row[]) {
      const threadId = String(row.thread_id)
      const { error: writeError } = await sb
        .from("messages")
        .update({ thread_id: `${newPrefix}${threadId.slice(oldPrefix.length)}` })
        .eq("id", row.id)
      if (writeError) fail("renameProvider", `messages : ${writeError.message}`)
    }
  }
}

export async function dbUpdateProvider(id: string, patch: ProviderPatch): Promise<ProviderAccount> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("updateProvider", "client indisponible")

  // Un renommage se propage : on lit le nom actuel avant de le modifier.
  let previousName: string | null = null
  if (patch.name !== undefined) {
    const { data: current } = await sb.from("providers").select("name").eq("id", id).maybeSingle()
    previousName = current ? String((current as Row).name) : null
  }

  const update: Row = {}
  if (patch.name !== undefined) update.name = patch.name
  if (patch.contactPerson !== undefined) update.contact_person = patch.contactPerson
  if (patch.phone !== undefined) update.phone = patch.phone
  if (patch.whatsapp !== undefined) update.whatsapp = patch.whatsapp
  if (patch.email !== undefined) update.email = patch.email
  if (patch.city !== undefined) update.city = patch.city
  if (patch.location !== undefined) update.location = patch.location
  if (patch.category !== undefined) update.category = patch.category
  if (patch.experience !== undefined) update.experience = patch.experience
  if (patch.bio !== undefined) update.bio = patch.bio
  if (patch.rccm !== undefined) update.rccm = patch.rccm
  if (patch.idNat !== undefined) update.id_nat = patch.idNat
  if (patch.status !== undefined) update.status = patch.status
  if (patch.verified !== undefined) update.verified = patch.verified
  if (patch.avatar !== undefined) update.avatar = patch.avatar
  if (patch.adminNotes !== undefined) update.admin_notes = patch.adminNotes
  if (patch.payoutMethod !== undefined) update.payout_method = patch.payoutMethod
  if (patch.payoutNumber !== undefined) update.payout_number = patch.payoutNumber
  const { data, error } = await sb.from("providers").update(update).eq("id", id).select("*").maybeSingle()
  if (error) fail("updateProvider", error.message)
  if (!data) throw new DbError("Compte prestataire introuvable.")
  const renamedTo = patch.name !== undefined ? String(patch.name) : null
  if (previousName && renamedTo && renamedTo !== previousName) {
    await dbPropagateProviderRename(id, previousName, renamedTo)
  }
  return rowToProvider(data)
}

export async function dbDeleteProvider(id: string): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("deleteProvider", "client indisponible")
  const { error } = await sb.from("providers").delete().eq("id", id)
  if (error) fail("deleteProvider", error.message)
}

// ===========================================================================
//  RÉSERVATIONS (bookings)
// ===========================================================================

export async function dbListBookings(filter?: {
  ids?: string[]
  providerName?: string
}): Promise<Booking[]> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("listBookings", "client indisponible")
  let query = sb.from("bookings").select("*").order("created_at", { ascending: false })
  if (filter?.ids?.length) query = query.in("id", filter.ids)
  if (filter?.providerName) query = query.ilike("provider_name", filter.providerName)
  const { data, error } = await query
  if (error) fail("listBookings", error.message)
  return (data ?? []).map(rowToBooking)
}

export type BookingInsert = Omit<Booking, "id" | "createdAt"> & { id?: string }

export async function dbCreateBooking(booking: BookingInsert): Promise<Booking> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("createBooking", "client indisponible")
  // Rattache la réservation au compte prestataire : l'identifiant résiste aux
  // renommages, contrairement au nom commercial.
  const providerId = await dbResolveProviderId(booking.providerName)
  const { data, error } = await sb
    .from("bookings")
    .insert({
      id: booking.id ?? undefined,
      event_id: booking.eventId ?? null,
      service_id: booking.serviceId || null,
      provider_id: providerId,
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
      provider_payout_method: booking.providerPayoutMethod ?? null,
      provider_payout_number: booking.providerPayoutNumber ?? null,
      platform_fee: booking.platformFeeUSD ?? undefined,
      provider_net: booking.providerNetUSD ?? undefined,
    })
    .select("*")
    .single()
  if (error) fail("createBooking", error.message)
  return rowToBooking(data)
}

export async function dbUpdateBookingStatus(id: string, status: Booking["status"]): Promise<Booking> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("updateBookingStatus", "client indisponible")
  const { data, error } = await sb.from("bookings").update({ status }).eq("id", id).select("*").maybeSingle()
  if (error) fail("updateBookingStatus", error.message)
  if (!data) throw new DbError("Réservation introuvable.")
  return rowToBooking(data)
}

// ===========================================================================
//  CÉRÉMONIES (ceremony_events)
// ===========================================================================

export async function dbListEvents(ids: string[]): Promise<CeremonyEvent[]> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("listEvents", "client indisponible")
  if (ids.length === 0) return []
  const { data, error } = await sb
    .from("ceremony_events")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: false })
  if (error) fail("listEvents", error.message)
  return (data ?? []).map(rowToEvent)
}

export async function dbGetEvent(id: string): Promise<CeremonyEvent | null> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("getEvent", "client indisponible")
  const { data, error } = await sb.from("ceremony_events").select("*").eq("id", id).maybeSingle()
  if (error) fail("getEvent", error.message)
  return data ? rowToEvent(data) : null
}

export async function dbCreateEvent(
  event: Omit<CeremonyEvent, "id" | "createdAt"> & { id?: string }
): Promise<CeremonyEvent> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("createEvent", "client indisponible")
  const { data, error } = await sb
    .from("ceremony_events")
    .insert({
      id: event.id ?? undefined,
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
    .select("*")
    .single()
  if (error) fail("createEvent", error.message)
  return rowToEvent(data)
}

// ===========================================================================
//  DEVIS (quotes)
// ===========================================================================

export async function dbCreateQuote(
  quote: QuoteData & { paymentMethod?: string; sessionId?: string }
): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("createQuote", "client indisponible")
  const { error } = await sb.from("quotes").insert({
    quote_number: quote.quoteNumber,
    kind: "devis",
    session_id: quote.sessionId ?? null,
    customer_name: quote.customerName,
    customer_phone: quote.customerPhone,
    customer_email: quote.customerEmail ?? null,
    ceremony_type: quote.ceremonyType ?? null,
    ceremony_date: quote.ceremonyDate ?? null,
    city: quote.city ?? null,
    items: quote.items.map((i) => ({
      serviceId: i.serviceId,
      name: i.service.name,
      price: i.service.price,
      priceUnit: i.service.priceUnit,
      date: i.date,
      time: i.time,
      provider: i.service.provider.name,
    })),
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
  if (error) fail("createQuote", error.message)
}

// ===========================================================================
//  MESSAGERIE (messages)
// ===========================================================================

export async function dbListMessages(filter?: {
  threadId?: string
  threadIds?: string[]
  providerName?: string
  adminThreads?: boolean
}): Promise<ChatMessage[]> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("listMessages", "client indisponible")
  let query = sb.from("messages").select("*").order("created_at", { ascending: true })
  if (filter?.threadId) query = query.eq("thread_id", filter.threadId)
  else if (filter?.threadIds?.length) query = query.in("thread_id", filter.threadIds)
  else if (filter?.providerName) {
    // Fils d'un prestataire : assistance admin + conversations clients
    query = query.or(
      `thread_id.eq.admin-${filter.providerName},thread_id.like.cp-${filter.providerName}-%`
    )
  } else if (filter?.adminThreads) {
    query = query.like("thread_id", "admin-%")
  }
  const { data, error } = await query
  if (error) fail("listMessages", error.message)
  return (data ?? []).map(rowToMessage)
}

export async function dbCreateMessage(
  message: Omit<ChatMessage, "id" | "createdAt">
): Promise<ChatMessage> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("createMessage", "client indisponible")
  const { data, error } = await sb
    .from("messages")
    .insert({
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
    .select("*")
    .single()
  if (error) fail("createMessage", error.message)
  return rowToMessage(data)
}

export async function dbMarkThreadRead(threadId: string, role?: string): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("markThreadRead", "client indisponible")
  let query = sb.from("messages").update({ read: true }).eq("thread_id", threadId)
  if (role) query = query.eq("to_role", role)
  const { error } = await query
  if (error) fail("markThreadRead", error.message)
}

// ===========================================================================
//  RETRAITS MOBILE MONEY (payout_requests)
// ===========================================================================

export async function dbListPayouts(providerName?: string): Promise<PayoutRequest[]> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("listPayouts", "client indisponible")
  let query = sb.from("payout_requests").select("*").order("requested_at", { ascending: false })
  if (providerName) query = query.ilike("provider_name", providerName)
  const { data, error } = await query
  if (error) fail("listPayouts", error.message)
  return (data ?? []).map(rowToPayout)
}

export async function dbCreatePayout(
  payout: Omit<PayoutRequest, "requestedAt" | "status">
): Promise<PayoutRequest> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("createPayout", "client indisponible")
  // Identifiant du compte : garantit que la demande reste rattachée au
  // prestataire même si son nom commercial est rectifié ensuite.
  const providerId = await dbResolveProviderId(payout.providerName)
  const { data, error } = await sb
    .from("payout_requests")
    .insert({
      provider_id: providerId,
      provider_name: payout.providerName,
      amount_usd: payout.amountUSD,
      amount_fc: payout.amountFC,
      method: payout.method,
      phone_number: payout.phoneNumber,
      status: "pending",
      notes: payout.notes ?? null,
    })
    .select("*")
    .single()
  if (error) fail("createPayout", error.message)
  return rowToPayout(data)
}

export async function dbUpdatePayout(
  id: string,
  patch: { status: "paid" | "rejected" | "processing"; transactionRef?: string; adminNotes?: string }
): Promise<PayoutRequest> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("updatePayout", "client indisponible")
  const { data, error } = await sb
    .from("payout_requests")
    .update({
      status: patch.status,
      transaction_ref: patch.transactionRef ?? null,
      admin_notes: patch.adminNotes ?? null,
      processed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle()
  if (error) fail("updatePayout", error.message)
  if (!data) throw new DbError("Demande de retrait introuvable.")
  return rowToPayout(data)
}

// ===========================================================================
//  PANIER VISITEUR (cart_items)
// ===========================================================================

export async function dbListCartItems(sessionId: string): Promise<CartItem[]> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("listCartItems", "client indisponible")
  const { data, error } = await sb
    .from("cart_items")
    .select("*, services(*)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
  if (error) fail("listCartItems", error.message)
  return (data ?? [])
    .filter((row: Row) => row.services)
    .map((row: Row) => ({
      id: String(row.id),
      serviceId: String(row.service_id),
      service: rowToService(row.services),
      date: typeof row.date === "string" ? row.date.slice(0, 10) : row.date,
      time: String(row.time ?? "10:00").slice(0, 5),
      notes: row.notes ?? undefined,
    }))
}

/** Remplace intégralement le panier d'un visiteur (suppression + insertion). */
export async function dbReplaceCartItems(
  sessionId: string,
  items: Array<{ serviceId: string; date: string; time: string; notes?: string }>
): Promise<void> {
  const sb = getSupabaseAdmin()
  if (!sb) fail("replaceCartItems", "client indisponible")
  const { error: delError } = await sb.from("cart_items").delete().eq("session_id", sessionId)
  if (delError) fail("replaceCartItems:delete", delError.message)
  if (items.length === 0) return
  const { error } = await sb.from("cart_items").insert(
    items.map((i) => ({
      session_id: sessionId,
      service_id: i.serviceId,
      date: i.date,
      time: i.time,
      notes: i.notes ?? null,
    }))
  )
  if (error) fail("replaceCartItems:insert", error.message)
}

// ===========================================================================
//  JOURNAL D'ACTIVITÉ (activity_log)
// ===========================================================================

export type ActivityType =
  | "provider_register"
  | "service_submit"
  | "service_approve"
  | "service_reject"
  | "booking_created"
  | "payout_request"

/** Trace une action métier dans le journal d'activité (jamais bloquant). */
export async function dbLogActivity(
  type: ActivityType,
  title: string,
  description?: string,
  actorRole: "client" | "provider" | "admin" = "admin"
): Promise<void> {
  try {
    const sb = getSupabaseAdmin()
    if (!sb) return
    await sb.from("activity_log").insert({ type, title, description, actor_role: actorRole })
  } catch (err) {
    console.warn("[db] logActivity:", err)
  }
}
