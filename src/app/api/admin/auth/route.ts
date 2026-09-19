import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"

/**
 * Authentification de l'espace administrateur — Smart Booking RDC 🇨🇩
 * ---------------------------------------------------------------------------
 * Le code secret est vérifié **côté serveur uniquement** : il n'est jamais
 * injecté dans le bundle JavaScript envoyé au navigateur (contrairement à un
 * simple `process.env` exposé côté client).
 *
 * Variable d'environnement : ADMIN_ACCESS_CODE (secours : "admin243").
 * À changer impérativement en production (Netlify → Environment variables).
 *
 * La session est matérialisée par un cookie httpOnly contenant un jeton HMAC :
 * il ne peut pas être forgé côté navigateur sans connaître le code secret.
 */

const COOKIE_NAME = "sb-rdc-admin-token"
const COOKIE_MAX_AGE = 60 * 60 * 12 // 12 heures
const TOKEN_PAYLOAD = "smart-booking-rdc::admin-session::v1"

function configuredCode(): string {
  return (process.env.ADMIN_ACCESS_CODE ?? "").trim() || "admin243"
}

function validCodes(): string[] {
  const codes = [configuredCode()]
  // Codes de développement acceptés uniquement hors production.
  if (process.env.NODE_ENV !== "production") codes.push("admin", "smart2026")
  return codes.map((c) => c.toLowerCase())
}

function sessionToken(): string {
  return createHmac("sha256", configuredCode()).update(TOKEN_PAYLOAD).digest("hex")
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

function isSessionValid(request: NextRequest): boolean {
  const value = request.cookies.get(COOKIE_NAME)?.value
  if (!value) return false
  return safeEqual(value, sessionToken())
}

/** GET — état de la session administrateur en cours. */
export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: isSessionValid(request) })
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
    res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 })
    return res
  }

  const submitted = (body.code ?? "").trim().toLowerCase()
  if (!submitted) {
    return NextResponse.json(
      { ok: false, authenticated: false, error: "Code administrateur manquant." },
      { status: 400 }
    )
  }

  const allowed = validCodes().some((code) => safeEqual(submitted, code))
  if (!allowed) {
    return NextResponse.json(
      { ok: false, authenticated: false, error: "Code administrateur incorrect." },
      { status: 401 }
    )
  }

  const res = NextResponse.json({ ok: true, authenticated: true })
  res.cookies.set(COOKIE_NAME, sessionToken(), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
  })
  return res
}
