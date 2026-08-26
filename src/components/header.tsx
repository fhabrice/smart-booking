"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Sparkles, Menu, X, Phone, MapPin, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useBookings } from "@/lib/booking-context"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const { bookings } = useBookings()
  const [mobileOpen, setMobileOpen] = useState(false)
  
  const activeBookings = bookings.filter(b => b.status !== 'cancelled').length

  const nav = [
    { href: "/", label: "Découvrir" },
    { href: "/bookings", label: "Mes réservations", badge: activeBookings || undefined },
    { href: "/providers", label: "Devenir prestataire" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90">
      {/* Top bar RDC */}
      <div className="bg-zinc-900 text-white dark:bg-white dark:text-black">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-[11px] sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="text-sm">🇨🇩</span> Plateforme 100% RDC • Nord-Kivu, Sud-Kivu, Kinshasa, Lubumbashi & toutes provinces</span>
            <span className="hidden items-center gap-1.5 sm:flex"><ShieldCheck className="h-3 w-3 text-emerald-400" /> Prestataires vérifiés par admin</span>
          </div>
          <a href="tel:+243976459970" className="flex items-center gap-1.5 font-semibold hover:underline">
            <Phone className="h-3 w-3" /> +243 976 459 970
          </a>
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold tracking-tight">Smart Booking</span>
                <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">EVENT</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-500">
                <MapPin className="h-3 w-3" /> RDC • Mariage • Conférence
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                )}
              >
                {item.label}
                {item.badge ? (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-500 px-1.5 text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-3 md:flex">
            <div className="hidden items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 dark:border-zinc-800 lg:flex">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {activeBookings} réservation{activeBookings !== 1 ? 's' : ''} • Validation admin 24h
              </span>
            </div>
            <a href="https://wa.me/243976459970" target="_blank">
              <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                <Phone className="h-4 w-4" />
                WhatsApp
              </Button>
            </a>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 md:hidden dark:border-zinc-800"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-100 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <nav className="flex flex-col gap-2">
            {nav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium",
                  pathname === item.href
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                    : "bg-zinc-50 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                )}
              >
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="rounded-full bg-violet-500 px-2 py-0.5 text-xs font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            ))}
            <a href="tel:+243976459970" className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-bold text-white">
              <Phone className="h-4 w-4" /> +243 976 459 970
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
