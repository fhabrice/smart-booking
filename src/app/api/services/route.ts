import { NextRequest, NextResponse } from "next/server"
import { dbUnavailable, isSupabaseConfigured } from "@/lib/server/supabase"
import { isAdminRequest } from "@/lib/server/admin-auth"
import {
  dbCreateService,
  dbListAllServices,
  dbListProviderServices,
  dbListPublicServices,
  dbLogActivity,
  DbError,
} from "@/lib/server/db"

export const dynamic = "force-dynamic"

/**
 * GET /api/services
 *   (défaut)                → vitrine publique : prestations approuvées,
 *                             non supprimées, non en pause, prestataire actif
 *   ?provider=<nom>         → toutes les prestations du prestataire (son espace)
 *   ?scope=all              → toutes les prestations — ADMIN uniquement
 *
 * POST /api/services  — publication d'une prestation (statut "pending",
 * soumise à modération admin). Corps : champs Service + { providerName }.
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const params = request.nextUrl.searchParams
    const scope = params.get("scope")
    const provider = params.get("provider")?.trim()

    if (scope === "all") {
      if (!isAdminRequest(request)) {
        return NextResponse.json({ ok: false, error: "Accès réservé à l'administrateur." }, { status: 401 })
      }
      return NextResponse.json({ ok: true, data: await dbListAllServices() })
    }
    if (provider) {
      return NextResponse.json({ ok: true, data: await dbListProviderServices(provider) })
    }
    return NextResponse.json({ ok: true, data: await dbListPublicServices() })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors du chargement des prestations."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) return NextResponse.json(dbUnavailable(), { status: 503 })
  try {
    const body = await request.json()
    const providerName = String(body?.provider?.name ?? "").trim()
    if (!providerName) {
      return NextResponse.json({ ok: false, error: "Prestataire manquant." }, { status: 400 })
    }
    if (!String(body?.name ?? "").trim()) {
      return NextResponse.json({ ok: false, error: "Nom de prestation manquant." }, { status: 400 })
    }
    const price = Number(body?.price ?? 0)
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ ok: false, error: "Prix invalide." }, { status: 400 })
    }
    const service = await dbCreateService({
      providerId: body.providerId,
      name: String(body.name).trim(),
      category: String(body.category ?? "salles"),
      description: String(body.description ?? ""),
      longDescription: String(body.longDescription ?? body.description ?? ""),
      price: Math.round(price),
      priceUnit: String(body.priceUnit ?? "la prestation"),
      duration: Number(body.duration ?? 240),
      rating: 5,
      reviews: 0,
      image: String(body.image ?? ""),
      images: Array.isArray(body.images) ? body.images : [],
      provider: {
        name: providerName,
        avatar: body.provider?.avatar ?? "/images/avatar-1.jpg",
        verified: Boolean(body.provider?.verified),
        experience: body.provider?.experience ?? "",
        rating: Number(body.provider?.rating ?? 5),
      },
      city: String(body.city ?? ""),
      location: String(body.location ?? ""),
      features: Array.isArray(body.features) ? body.features : [],
      popular: false,
      instant: Boolean(body.instant ?? true),
      paused: false,
      custom: true,
      adminApprovalStatus: "pending", // passage obligatoire par la modération admin
    })
    await dbLogActivity(
      "service_submit",
      `Nouvelle prestation soumise : ${service.name}`,
      `${providerName} a soumis « ${service.name} » (${service.category}) à la modération.`,
      "provider"
    )
    return NextResponse.json({ ok: true, data: service }, { status: 201 })
  } catch (err) {
    const message = err instanceof DbError ? err.message : "Erreur lors de la publication."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
