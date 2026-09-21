import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { isAdminRequest } from "@/lib/server/admin-auth"
import { dbDeleteService, dbGetService, dbLogActivity, dbUpdateService, DbError, type ServicePatch } from "@/lib/server/db"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

/** GET /api/services/[id] — détail d'une prestation. */
export async function GET(_request: NextRequest, { params }: Params) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const { id } = await params
    const service = await dbGetService(id)
    if (!service) {
      return NextResponse.json({ ok: false, error: "Prestation introuvable." }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: service })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors du chargement."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

/**
 * PATCH /api/services/[id] — mise à jour d'une prestation.
 * Champs « modération » (adminApprovalStatus, adminFeedback, isDeleted) :
 * réservés à l'administrateur (cookie de session admin requis).
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const { id } = await params
    const body = (await request.json()) as ServicePatch

    const touchesModeration =
      body.adminApprovalStatus !== undefined || body.adminFeedback !== undefined || body.isDeleted !== undefined
    if (touchesModeration && !isAdminRequest(request)) {
      return NextResponse.json({ ok: false, error: "Modération réservée à l'administrateur." }, { status: 401 })
    }

    const before = await dbGetService(id)
    const service = await dbUpdateService(id, body)

    if (before && body.adminApprovalStatus && before.adminApprovalStatus !== body.adminApprovalStatus) {
      await dbLogActivity(
        body.adminApprovalStatus === "approved" ? "service_approve" : "service_reject",
        body.adminApprovalStatus === "approved"
          ? `Prestation approuvée : ${service.name}`
          : `Prestation rejetée : ${service.name}`,
        body.adminFeedback ?? undefined
      )
    }
    return NextResponse.json({ ok: true, data: service })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de la mise à jour."
    const status = err instanceof DbError && message.includes("introuvable") ? 404 : 500
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}

/** DELETE /api/services/[id] — le prestataire retire définitivement sa prestation. */
export async function DELETE(_request: NextRequest, { params }: Params) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const { id } = await params
    await dbDeleteService(id)
    return NextResponse.json({ ok: true, data: { id } })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de la suppression."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
