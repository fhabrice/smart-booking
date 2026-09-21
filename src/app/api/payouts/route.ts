import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { isAdminRequest } from "@/lib/server/admin-auth"
import { dbCreatePayout, dbListPayouts, dbLogActivity, DbError } from "@/lib/server/db"

export const dynamic = "force-dynamic"

const USD_TO_FC = Number(process.env.USD_TO_FC_RATE ?? process.env.NEXT_PUBLIC_USD_TO_FC_RATE ?? 2850) || 2850

/**
 * GET /api/payouts
 *   ?provider=<nom>  → retraits d'un prestataire (son espace)
 *   ?scope=all       → tous les retraits — ADMIN uniquement
 *
 * POST /api/payouts — demande de retrait Mobile Money (prestataire).
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const params = request.nextUrl.searchParams
    const provider = params.get("provider")?.trim()
    const scope = params.get("scope")

    if (scope === "all") {
      if (!isAdminRequest(request)) {
        return NextResponse.json({ ok: false, error: "Accès réservé à l'administrateur." }, { status: 401 })
      }
      return NextResponse.json({ ok: true, data: await dbListPayouts() })
    }
    if (provider) {
      return NextResponse.json({ ok: true, data: await dbListPayouts(provider) })
    }
    return NextResponse.json({ ok: true, data: [] })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors du chargement des retraits."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const body = await request.json()
    const providerName = String(body?.providerName ?? "").trim()
    const amountUSD = Number(body?.amountUSD ?? 0)
    const method = String(body?.method ?? "")
    const phoneNumber = String(body?.phoneNumber ?? "").trim()
    if (!providerName || !phoneNumber || !["M-Pesa", "Orange Money", "Airtel Money"].includes(method)) {
      return NextResponse.json({ ok: false, error: "Demande de retrait incomplète." }, { status: 400 })
    }
    if (!Number.isFinite(amountUSD) || amountUSD <= 0) {
      return NextResponse.json({ ok: false, error: "Montant invalide." }, { status: 400 })
    }
    const payout = await dbCreatePayout({
      id: body.id,
      providerName,
      amountUSD,
      amountFC: Math.round(amountUSD * USD_TO_FC),
      method: method as "M-Pesa" | "Orange Money" | "Airtel Money",
      phoneNumber,
      notes: body.notes,
    })
    await dbLogActivity(
      "payout_request",
      `Demande de retrait : ${amountUSD} USD — ${providerName}`,
      `${method} → ${phoneNumber}`,
      "provider"
    )
    return NextResponse.json({ ok: true, data: payout }, { status: 201 })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de la demande de retrait."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
