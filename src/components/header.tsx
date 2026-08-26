"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Sparkles, Menu, X } from "lucide-react"
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
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">Smart Booking</span>
            <span className="ml-1 hidden rounded-full bg-violet-500 px-2 py-0.5 text-[10px] font-bold text-white sm:inline-block">BETA</span>
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
            <div className="flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-1.5 dark:border-zinc-800">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                {activeBookings} réservation{activeBookings !== 1 ? 's' : ''} active{activeBookings !== 1 ? 's' : ''}
              </span>
            </div>
            <Button size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Nouveau
            </Button>
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
          </nav>
        </div>
      )}
    </header>
  )
}
