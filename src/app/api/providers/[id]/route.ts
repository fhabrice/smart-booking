import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { isAdminRequest } from "@/lib/server/admin-auth"
import { dbDeleteProvider, dbUpdateProvider, DbError, type ProviderPatch } from "@/lib/server/db"

export const dynamic = "force-dynamic"

type Params = { params: Promise<{ id: string }> }

/** Champs qu'un prestataire peut modifier lui-même (profil public + payouts). */
const SELF_EDITABLE: (keyof ProviderPatch)[] = [
  "contactPerson",
  "phone",
  "whatsapp",
  "email",
  "city",
  "location",
  "category",
  "experience",
  "bio",
  "avatar",
  "payoutMethod",
  "payoutNumber",
]

/**
 * PATCH /api/providers/[id]
 *   - Admin (cookie) : tous les champs, dont status / verified / adminNotes.
 *   - Prestataire : uniquement les champs de profil (voir SELF_EDITABLE).
 * DELETE /api/providers/[id] — suppression du compte (admin uniquement).
 */
export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const { id } = await params
    const body = (await request.json()) as ProviderPatch
    const admin = isAdminRequest(request)

    const patch: ProviderPatch = admin
      ? body
      : Object.fromEntries(
          SELF_EDITABLE.filter((k) => body[k] !== undefined).map((k) => [k, body[k]])
        )
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ ok: false, error: "Aucun champ modifiable fourni." }, { status: 400 })
    }
    if (patch.status !== undefined) {
      // Une approbation certifie le compte ; une suspension retire le badge.
      patch.verified = patch.status === "approved"
    }
    const account = await dbUpdateProvider(id, patch)
    return NextResponse.json({ ok: true, data: account })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de la mise à jour du compte."
    const status = err instanceof DbError && message.includes("introuvable") ? 404 : 500
    return NextResponse.json({ ok: false, error: message }, { status })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Suppression réservée à l'administrateur." }, { status: 401 })
  }
  try {
    const { id } = await params
    await dbDeleteProvider(id)
    return NextResponse.json({ ok: true, data: { id } })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de la suppression du compte."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
