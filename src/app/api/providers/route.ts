import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { dbCreateProvider, dbListProviders, dbLogActivity, DbError } from "@/lib/server/db"

export const dynamic = "force-dynamic"

/**
 * GET /api/providers — comptes prestataires enregistrés (connexion, admin,
 * résolution des comptes de paiement affichés au client au moment du règlement).
 *
 * POST /api/providers — inscription d'un nouveau prestataire.
 * Le statut est forcé à "pending" (validation administrative obligatoire).
 */
export async function GET() {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    return NextResponse.json({ ok: true, data: await dbListProviders() })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors du chargement des prestataires."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const body = await request.json()
    const name = String(body?.name ?? "").trim()
    const contactPerson = String(body?.contactPerson ?? "").trim()
    const phone = String(body?.phone ?? "").trim()
    if (!name || !contactPerson || phone.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Nom de l'établissement, responsable et téléphone valides requis." },
        { status: 400 }
      )
    }
    const account = await dbCreateProvider({
      name,
      contactPerson,
      phone,
      whatsapp: body.whatsapp,
      email: body.email,
      city: body.city,
      location: body.location,
      category: body.category,
      experience: body.experience,
      bio: body.bio,
      rccm: body.rccm,
      idNat: body.idNat,
      avatar: body.avatar,
      payoutMethod: body.payoutMethod,
      payoutNumber: body.payoutNumber,
    })
    await dbLogActivity(
      "provider_register",
      `Nouvelle inscription prestataire : ${account.name}`,
      `${account.contactPerson} (${account.city}) — en attente de validation.`,
      "provider"
    )
    return NextResponse.json({ ok: true, data: account }, { status: 201 })
  } catch (err) {
    if (err instanceof DbError && err.message.includes("existe déjà")) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 409 })
    }
    const message = err instanceof DbError ? err.message : "Erreur lors de l'inscription."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
