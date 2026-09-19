import { getSupabase, isSupabaseConfigured } from "./client"
import {
  insertBooking,
  insertEvent,
  insertMessage,
  insertPayout,
  insertProvider,
  insertQuote,
  insertService,
  processPayout,
  setBookingStatus,
  setProviderStatus,
  setServiceApproval,
} from "./db"
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
 * Miroir d'écriture Supabase — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * L'application reste pilotée par ses contextes React (persistance locale
 * `localStorage`). Quand le projet Supabase est configuré, chaque action
 * métier est **également** poussée vers la base, en arrière-plan :
 *
 *   • jamais bloquant  → l'appel est `fire and forget`
 *   • jamais cassant   → toute erreur est journalisée puis ignorée
 *   • jamais hors-ligne → si `isSupabaseConfigured` est faux, on ne fait rien
 *   • tolérant aux clés étrangères → une ligne orpheline (ex. réservation dont la
 *     prestation n'a pas encore été importée) est simplement ignorée
 *
 * Cela permet d'activer la base de données sur Netlify simplement en ajoutant
 * NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY, sans réécrire
 * l'interface existante.
 */

function guard(label: string, run: () => Promise<unknown>) {
  if (!isSupabaseConfigured || !getSupabase()) return
  run().catch((err) => console.warn(`[supabase:sync] ${label}`, err))
}

/** Inscription d'un nouveau prestataire (statut `pending`, à approuver). */
export function syncProviderRegistration(
  account: Partial<ProviderAccount> & { name: string; contactPerson: string; phone: string }
) {
  guard("provider_registration", () => insertProvider(account))
}

/** Validation / suspension d'un prestataire par l'admin. */
export function syncProviderStatus(
  providerId: string,
  status: "pending" | "approved" | "suspended",
  adminNotes?: string
) {
  guard("provider_status", () => setProviderStatus(providerId, status, adminNotes))
}

/** Publication d'une prestation par un prestataire. */
export function syncServiceCreation(service: Service & { providerId?: string }) {
  guard("service_creation", () => insertService(service))
}

/** Approbation / rejet d'une prestation par l'admin. */
export function syncServiceApproval(
  serviceId: string,
  status: "approved" | "rejected",
  feedback?: string
) {
  guard("service_approval", () => setServiceApproval(serviceId, status, feedback))
}

/** Création d'une réservation côté client. */
export function syncBookingCreation(booking: Booking) {
  guard("booking_creation", () => insertBooking(booking))
}

/** Création d'une cérémonie (panier multi-prestations). */
export function syncEventCreation(event: CeremonyEvent) {
  guard("event_creation", () => insertEvent(event))
}

/** Changement de statut d'une réservation. */
export function syncBookingStatus(bookingId: string, status: Booking["status"]) {
  guard("booking_status", () => setBookingStatus(bookingId, status))
}

/** Enregistrement d'un devis / d'une facture d'acompte. */
export function syncQuote(quote: QuoteData & { paymentMethod?: string }) {
  guard("quote", () => insertQuote(quote))
}

/** Envoi d'un message (client ↔ prestataire ↔ admin). */
export function syncMessage(message: Omit<ChatMessage, "id" | "createdAt">) {
  guard("message", () => insertMessage(message))
}

/** Demande de retrait Mobile Money (M-Pesa, Orange Money, Airtel Money). */
export function syncPayoutRequest(
  payout: Omit<PayoutRequest, "requestedAt" | "status"> & { requestedAt?: string; status?: string }
) {
  guard("payout_request", () => insertPayout(payout))
}

/** Paiement d'un retrait validé par l'admin. */
export function syncPayoutProcessed(payoutId: string, transactionRef: string) {
  guard("payout_processed", () => processPayout(payoutId, transactionRef))
}
