import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
