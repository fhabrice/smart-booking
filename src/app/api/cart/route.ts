import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { dbListCartItems, dbReplaceCartItems, DbError } from "@/lib/server/db"

export const dynamic = "force-dynamic"

/**
 * GET /api/cart?session=<id> — panier du visiteur (prestations jointes).
 * PUT /api/cart — remplacement du panier { session, items: [{ serviceId, date, time, notes }] }.
 *
 * Le panier est stocké en base (table `cart_items`) et rattaché à un
 * identifiant de session anonyme conservé par le navigateur du visiteur.
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const session = request.nextUrl.searchParams.get("session")?.trim()
    if (!session) {
      return NextResponse.json({ ok: false, error: "Identifiant de session manquant." }, { status: 400 })
    }
    return NextResponse.json({ ok: true, data: await dbListCartItems(session) })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors du chargement du panier."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const body = await request.json()
    const session = String(body?.session ?? "").trim()
    if (!session) {
      return NextResponse.json({ ok: false, error: "Identifiant de session manquant." }, { status: 400 })
    }
    const items = Array.isArray(body?.items) ? body.items : []
    const cleaned = items
      .filter((i: Record<string, unknown>) => i?.serviceId && i?.date && i?.time)
      .map((i: Record<string, unknown>) => ({
        serviceId: String(i.serviceId),
        date: String(i.date),
        time: String(i.time),
        notes: i.notes ? String(i.notes) : undefined,
      }))
    await dbReplaceCartItems(session, cleaned)
    return NextResponse.json({ ok: true, data: await dbListCartItems(session) })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de l'enregistrement du panier."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
