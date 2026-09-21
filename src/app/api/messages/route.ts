import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { isAdminRequest } from "@/lib/server/admin-auth"
import { dbCreateMessage, dbListMessages, DbError } from "@/lib/server/db"
import type { ChatMessage } from "@/lib/types"

export const dynamic = "force-dynamic"

/**
 * GET /api/messages
 *   ?thread=<id>        → messages d'un fil
 *   ?threads=a,b,c      → messages de plusieurs fils
 *   ?provider=<nom>     → tous les fils d'un prestataire (assistance + clients)
 *   ?scope=admin        → fils d'assistance prestataires — ADMIN uniquement
 *
 * POST /api/messages — envoi d'un message (client ↔ prestataire ↔ admin).
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const params = request.nextUrl.searchParams
    const thread = params.get("thread")?.trim()
    const threads = (params.get("threads") ?? "").split(",").map((s) => s.trim()).filter(Boolean)
    const provider = params.get("provider")?.trim()
    const scope = params.get("scope")

    if (scope === "admin") {
      if (!isAdminRequest(request)) {
        return NextResponse.json({ ok: false, error: "Accès réservé à l'administrateur." }, { status: 401 })
      }
      return NextResponse.json({ ok: true, data: await dbListMessages({ adminThreads: true }) })
    }
    if (provider) {
      return NextResponse.json({ ok: true, data: await dbListMessages({ providerName: provider }) })
    }
    if (thread) {
      return NextResponse.json({ ok: true, data: await dbListMessages({ threadId: thread }) })
    }
    if (threads.length > 0) {
      return NextResponse.json({ ok: true, data: await dbListMessages({ threadIds: threads }) })
    }
    return NextResponse.json({ ok: true, data: [] })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors du chargement des messages."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const body = (await request.json()) as Partial<ChatMessage>
    if (!body?.threadId || !body?.content?.trim() || !body?.fromRole || !body?.fromName || !body?.toRole || !body?.toName) {
      return NextResponse.json({ ok: false, error: "Message incomplet." }, { status: 400 })
    }
    if (!["client", "provider", "admin"].includes(body.fromRole) || !["client", "provider", "admin"].includes(body.toRole)) {
      return NextResponse.json({ ok: false, error: "Rôle invalide." }, { status: 400 })
    }
    // Un message « émis par l'admin » exige la session administrateur.
    if (body.fromRole === "admin" && !isAdminRequest(request)) {
      return NextResponse.json({ ok: false, error: "Session administrateur requise." }, { status: 401 })
    }
    const message = await dbCreateMessage({
      threadId: String(body.threadId),
      fromRole: body.fromRole,
      fromName: String(body.fromName),
      toRole: body.toRole,
      toName: String(body.toName),
      content: String(body.content).trim(),
      bookingId: body.bookingId,
      serviceId: body.serviceId,
      read: false,
    })
    return NextResponse.json({ ok: true, data: message }, { status: 201 })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de l'envoi du message."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
