import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { dbCreateEvent, dbListEvents, DbError } from "@/lib/server/db"

export const dynamic = "force-dynamic"

/**
 * GET /api/events?ids=a,b,c — cérémonies précises (celles du visiteur).
 * POST /api/events — création d'une cérémonie par un client.
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const ids = (request.nextUrl.searchParams.get("ids") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    if (ids.length === 0) return NextResponse.json({ ok: true, data: [] })
    return NextResponse.json({ ok: true, data: await dbListEvents(ids) })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors du chargement des cérémonies."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const body = await request.json()
    if (!body?.title || !body?.date || !body?.type || !body?.city) {
      return NextResponse.json(
        { ok: false, error: "Champs requis : type, title, date, city." },
        { status: 400 }
      )
    }
    const event = await dbCreateEvent({
      id: body.id ? String(body.id) : undefined,
      type: String(body.type),
      title: String(body.title),
      date: String(body.date),
      time: String(body.time ?? "10:00"),
      city: String(body.city),
      venue: String(body.venue ?? ""),
      guests: Number(body.guests ?? 100),
      budget: Number(body.budget ?? 0),
      notes: body.notes,
    })
    return NextResponse.json({ ok: true, data: event }, { status: 201 })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de la création de la cérémonie."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
