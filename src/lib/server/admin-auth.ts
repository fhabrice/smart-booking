import { createHmac, timingSafeEqual } from "crypto"
import type { NextRequest } from "next/server"

/**
 * Session administrateur — logique partagée entre la route de connexion
 * (`/api/admin/auth`) et toutes les routes d'administration / modération.
 *
 * Le cookie httpOnly contient un jeton HMAC dérivé du code secret :
 * il ne peut pas être forgé côté navigateur.
 */

export const ADMIN_COOKIE_NAME = "sb-rdc-admin-token"
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 12 // 12 heures
const TOKEN_PAYLOAD = "smart-booking-rdc::admin-session::v1"

export function configuredAdminCode(): string {
  return (process.env.ADMIN_ACCESS_CODE ?? "").trim() || "admin243"
}

export function validAdminCodes(): string[] {
  const codes = [configuredAdminCode()]
  // Codes de développement acceptés uniquement hors production.
  if (process.env.NODE_ENV !== "production") codes.push("admin", "smart2026")
  return codes.map((c) => c.toLowerCase())
}

export function adminSessionToken(): string {
  return createHmac("sha256", configuredAdminCode()).update(TOKEN_PAYLOAD).digest("hex")
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/** true si la requête porte un cookie de session administrateur valide. */
export function isAdminRequest(request: NextRequest): boolean {
  const value = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!value) return false
  return safeEqual(value, adminSessionToken())
}
