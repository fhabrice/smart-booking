import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { isAdminRequest } from "@/lib/server/admin-auth"
import { dbCreateBooking, dbListBookings, dbLogActivity, DbError } from "@/lib/server/db"
import type { Booking } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * GET /api/bookings
 *   ?ids=a,b,c          → réservations précises (réservations du visiteur)
 *   ?provider=<nom>     → réservations d'un prestataire (son espace)
 *   ?scope=all          → toutes les réservations — ADMIN uniquement
 *
 * POST /api/bookings — création d'une réservation (client).
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const params = request.nextUrl.searchParams
    const ids = (params.get("ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean)
    const provider = params.get("provider")?.trim()
    const scope = params.get("scope")

    if (scope === "all") {
      if (!isAdminRequest(request)) {
        return NextResponse.json({ ok: false, error: "Accès réservé à l'administrateur." }, { status: 401 })
      }
      return NextResponse.json({ ok: true, data: await dbListBookings() })
    }
    if (provider) {
      return NextResponse.json({ ok: true, data: await dbListBookings({ providerName: provider }) })
    }
    if (ids.length > 0) {
      return NextResponse.json({ ok: true, data: await dbListBookings({ ids }) })
    }
    return NextResponse.json({ ok: true, data: [] })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors du chargement des réservations."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const body = (await request.json()) as Partial<Booking>
    const required: (keyof Booking)[] = [
      "serviceId", "serviceName", "providerName", "date", "time",
      "price", "deposit", "paymentMethod", "customerName", "customerPhone", "city",
    ]
    const missing = required.filter((k) => body[k] === undefined || body[k] === "")
    if (missing.length > 0) {
      return NextResponse.json({ ok: false, error: `Champs manquants : ${missing.join(", ")}` }, { status: 400 })
    }
    const booking = await dbCreateBooking({
      eventId: body.eventId,
      serviceId: String(body.serviceId),
      serviceName: String(body.serviceName),
      serviceImage: String(body.serviceImage ?? ""),
      serviceCategory: String(body.serviceCategory ?? ""),
      date: String(body.date),
      time: String(body.time),
      duration: Number(body.duration ?? 240),
      price: Number(body.price),
      deposit: Number(body.deposit),
      paymentMethod: String(body.paymentMethod),
      status: body.status === "confirmed" ? "confirmed" : "pending",
      customerName: String(body.customerName),
      customerPhone: String(body.customerPhone),
      customerEmail: body.customerEmail,
      providerName: String(body.providerName),
      location: String(body.location ?? ""),
      city: String(body.city),
      providerPayoutMethod: body.providerPayoutMethod,
      providerPayoutNumber: body.providerPayoutNumber,
      platformFeeUSD: body.platformFeeUSD,
      providerNetUSD: body.providerNetUSD,
    })
    await dbLogActivity(
      "booking_created",
      `Nouvelle réservation : ${booking.serviceName}`,
      `${booking.customerName} → ${booking.providerName} le ${booking.date} (${booking.price} USD).`,
      "client"
    )
    return NextResponse.json({ ok: true, data: booking }, { status: 201 })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de la réservation."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
