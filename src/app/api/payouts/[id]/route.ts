import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { isAdminRequest } from "@/lib/server/admin-auth"
import { dbUpdatePayout, DbError } from "@/lib/server/db"

export const dynamic = "force-dynamic"

/**
 * PATCH /api/payouts/[id] — traitement d'une demande de retrait — ADMIN.
 * Corps : { action: "process", transactionRef } | { action: "reject", notes }
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Traitement réservé à l'administrateur." }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = await request.json()
    const action = String(body?.action ?? "")
    if (action === "process") {
      const transactionRef = String(body?.transactionRef ?? "").trim()
      if (!transactionRef) {
        return NextResponse.json(
          { ok: false, error: "Référence de transaction opérateur requise." },
          { status: 400 }
        )
      }
      const payout = await dbUpdatePayout(id, { status: "paid", transactionRef })
      return NextResponse.json({ ok: true, data: payout })
    }
    if (action === "reject") {
      const payout = await dbUpdatePayout(id, {
        status: "rejected",
        adminNotes: String(body?.notes ?? "").trim() || undefined,
      })
      return NextResponse.json({ ok: true, data: payout })
    }
    return NextResponse.json({ ok: false, error: "Action inconnue (process | reject)." }, { status: 400 })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors du traitement du retrait."
    const status = err instanceof DbError && message.includes("introuvable") ? 404 : 500
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}
