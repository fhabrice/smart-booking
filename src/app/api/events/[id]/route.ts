import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { dbGetEvent, DbError } from "@/lib/server/db"

export const dynamic = "force-dynamic"

/** GET /api/events/[id] — détail d'une cérémonie. */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const { id } = await params
    const event = await dbGetEvent(id)
    if (!event) {
      return NextResponse.json({ ok: false, error: "Cérémonie introuvable." }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: event })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors du chargement."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
