import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { dbMarkThreadRead, DbError } from "@/lib/server/db"

export const dynamic = "force-dynamic"

/** POST /api/messages/read — marque un fil comme lu { threadId, toRole? }. */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const body = await request.json()
    const threadId = String(body?.threadId ?? "").trim()
    if (!threadId) {
      return NextResponse.json({ ok: false, error: "threadId manquant." }, { status: 400 })
    }
    const toRole = ["client", "provider", "admin"].includes(body?.toRole) ? body.toRole : undefined
    await dbMarkThreadRead(threadId, toRole)
    return NextResponse.json({ ok: true, data: { threadId } })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de la mise à jour."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
