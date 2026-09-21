import { NextRequest, NextResponse } from "next/server"
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  adminSessionToken,
  isAdminRequest,
  safeEqual,
  validAdminCodes,
} from "@/lib/server/admin-auth"

/**
 * Authentification de l'espace administrateur — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * Le code secret est vérifié **côté serveur uniquement** : il n'est jamais
 * injecté dans le bundle JavaScript envoyé au navigateur.
 *
 * Variable d'environnement : ADMIN_ACCESS_CODE (secours : "admin243").
 * À changer impérativement en production (Netlify → Environment variables).
 *
 * La session est matérialisée par un cookie httpOnly contenant un jeton HMAC.
 */

export const dynamic = "force-dynamic"

/** GET — état de la session administrateur en cours. */
export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: isAdminRequest(request) })
}

/** POST — connexion ({ action: "login", code }) ou déconnexion ({ action: "logout" }). */
export async function POST(request: NextRequest) {
  let body: { action?: string; code?: string } = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const action = body.action ?? "login"

  if (action === "logout") {
    const res = NextResponse.json({ ok: true, authenticated: false })
    res.cookies.set(ADMIN_COOKIE_NAME, "", { path: "/", maxAge: 0 })
    return res
  }

  const submitted = (body.code ?? "").trim().toLowerCase()
  if (!submitted) {
    return NextResponse.json(
      { ok: false, authenticated: false, error: "Code administrateur manquant." },
      { status: 400 }
    )
  }

  const allowed = validAdminCodes().some((code) => safeEqual(submitted, code))
  if (!allowed) {
    return NextResponse.json(
      { ok: false, authenticated: false, error: "Code administrateur incorrect." },
      { status: 401 }
    )
  }

  const res = NextResponse.json({ ok: true, authenticated: true })
  res.cookies.set(ADMIN_COOKIE_NAME, adminSessionToken(), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  })
  return res
}
