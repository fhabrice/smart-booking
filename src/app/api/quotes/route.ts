import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { dbCreateQuote, DbError } from "@/lib/server/db"
import type { QuoteData } from "@/lib/types"

export const dynamic = "force-dynamic"

/** POST /api/quotes — enregistrement d'un devis pro-forma (panier → devis). */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const body = (await request.json()) as QuoteData & { paymentMethod?: string; sessionId?: string }
    if (!body?.quoteNumber || !body?.customerName || !body?.customerPhone || !Array.isArray(body?.items)) {
      return NextResponse.json({ ok: false, error: "Devis incomplet." }, { status: 400 })
    }
    await dbCreateQuote(body)
    return NextResponse.json({ ok: true, data: { quoteNumber: body.quoteNumber } }, { status: 201 })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de l'enregistrement du devis."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
