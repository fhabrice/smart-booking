import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { dbUpdateBookingStatus, DbError } from "@/lib/server/db"
import type { Booking } from "@/lib/types"

export const dynamic = "force-dynamic"

const ALLOWED_STATUSES: Booking["status"][] = ["pending", "confirmed", "completed", "cancelled"]

/** PATCH /api/bookings/[id] — changement de statut { status }. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const { id } = await params
    const body = await request.json()
    const status = body?.status as Booking["status"]
    if (!ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ ok: false, error: "Statut invalide." }, { status: 400 })
    }
    const booking = await dbUpdateBookingStatus(id, status)
    return NextResponse.json({ ok: true, data: booking })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de la mise à jour."
    const statusCode = err instanceof DbError && message.includes("introuvable") ? 404 : 500
    return NextResponse.json({ ok: false, error: message }, { status: statusCode })
  }
}
