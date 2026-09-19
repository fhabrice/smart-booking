import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addMonths, endOfDay, format, startOfDay } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Horizon de réservation de la plateforme : les calendriers (client et prestataire)
 * couvrent 24 mois glissants à partir d'aujourd'hui.
 */
export const BOOKING_HORIZON_MONTHS = 24

/** Date au format ISO yyyy-MM-dd (clés des cartes calendrier, champs type="date") */
export function isoDay(date: Date) {
  return format(date, "yyyy-MM-dd")
}

/** Première date réservable : aujourd'hui, à minuit */
export function minBookableDate(base: Date = new Date()) {
  return startOfDay(base)
}

/** Dernière date réservable : aujourd'hui + BOOKING_HORIZON_MONTHS, à 23h59 */
export function maxBookableDate(base: Date = new Date()) {
  return endOfDay(addMonths(startOfDay(base), BOOKING_HORIZON_MONTHS))
}

/**
 * Ramène une date ISO (yyyy-MM-dd) dans la fenêtre réservable.
 * Utilisé par les champs natifs type="date" que le navigateur laisse parfois
 * saisir hors bornes (saisie clavier, collage).
 */
export function clampToBookableRange(iso: string, base: Date = new Date()) {
  if (!iso) return iso
  const parsed = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return iso
  const min = minBookableDate(base)
  const max = maxBookableDate(base)
  if (parsed < min) return isoDay(min)
  if (parsed > max) return isoDay(max)
  return iso
}

/** Taux indicatif 1 USD ≈ FC (franc congolais) */
export const USD_TO_FC_RATE = 2850

export function toFC(usd: number) {
  return Math.round(usd * USD_TO_FC_RATE)
}

export function formatPrice(price: number) {
  return `$${price.toLocaleString("fr-FR")}`
}

export function formatPriceFC(usd: number) {
  return `${toFC(usd).toLocaleString("fr-FR")} FC`
}

/** Ex: "$75 · 213 750 FC" */
export function formatBoth(usd: number) {
  return `${formatPrice(usd)} · ${formatPriceFC(usd)}`
}

export function generateTimeSlots(): string[] {
  const slots = []
  for (let hour = 6; hour <= 23; hour++) {
    for (const minute of [0, 30]) {
      if (hour === 23 && minute === 30) continue
      slots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)
    }
  }
  return slots
}

export function bookingReference(id: string) {
  return `SB-${id.toUpperCase()}`
}
