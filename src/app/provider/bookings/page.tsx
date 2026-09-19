"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useProviderSpace } from "@/lib/provider-context"
import { useBookings } from "@/lib/booking-context"
import { formatPrice, formatPriceFC, bookingReference, cn } from "@/lib/utils"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Check,
  X,
  CheckCheck,
  Search,
  Ticket,
  Smartphone,
  PartyPopper,
} from "lucide-react"

const filters = [
  { id: "all", label: "Toutes" },
  { id: "pending", label: "En attente" },
  { id: "confirmed", label: "Confirmées" },
  { id: "completed", label: "Terminées" },
  { id: "cancelled", label: "Annulées" },
] as const

export default function ProviderBookingsPage() {
  const { session } = useProviderSpace()
  const { bookings, events, updateBookingStatus } = useBookings()
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all")
  const [query, setQuery] = useState("")

  const myBookings = useMemo(
    () => bookings.filter((b) => b.providerName === session),
    [bookings, session]
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: myBookings.length }
    for (const b of myBookings) c[b.status] = (c[b.status] ?? 0) + 1
    return c
  }, [myBookings])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return myBookings
      .filter((b) => filter === "all" || b.status === filter)
      .filter(
        (b) =>
          !q ||
          b.customerName.toLowerCase().includes(q) ||
          b.serviceName.toLowerCase().includes(q) ||
          bookingReference(b.id).toLowerCase().includes(q) ||
          b.customerPhone.includes(q)
      )
      .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))
  }, [myBookings, filter, query])

  const totalVolume = myBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.price, 0)

  if (!session) return null

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Réservations reçues</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {counts.all} réservation{counts.all > 1 ? "s" : ""} • {formatPrice(totalVolume)} de volume (
            {formatPriceFC(totalVolume)}) hors annulations
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Client, référence, téléphone…"
            className="h-10 w-full rounded-full border border-zinc-200 bg-white pl-10 pr-4 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Filtres */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              filter === f.id
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                filter === f.id
                  ? "bg-white/20 dark:bg-black/10"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
              )}
            >
              {counts[f.id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-[32px] border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Ticket className="h-7 w-7 text-zinc-400" />
          </div>
          <h3 className="mt-5 font-semibold">Aucune réservation ici</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
            {query
              ? "Aucun résultat pour cette recherche."
              : "Les nouvelles demandes des clients apparaîtront automatiquement dans cette liste."}
          </p>
          <Link href="/provider/dashboard" className="mt-5 inline-flex">
            <Button variant="outline" size="sm" className="gap-2">
              Retour au tableau de bord
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filtered.map((booking) => {
            const event = booking.eventId ? events.find((e) => e.id === booking.eventId) : undefined
            return (
              <div
                key={booking.id}
                className={cn(
                  "rounded-[24px] border bg-white p-5 transition-all dark:bg-zinc-900",
                  booking.status === "cancelled"
                    ? "border-zinc-100 opacity-60 dark:border-zinc-800/60"
                    : "border-zinc-200 hover:shadow-lg dark:border-zinc-800"
                )}
              >
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-32">
                    <img src={booking.serviceImage} alt={booking.serviceName} className="h-full w-full object-cover" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <BookingStatusBadge status={booking.status} />
                          {event && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                              <PartyPopper className="h-3 w-3" /> {event.title}
                            </span>
                          )}
                          <span className="font-mono text-[10px] font-bold text-zinc-400">
                            {bookingReference(booking.id)}
                          </span>
                        </div>
                        <h3 className="mt-1.5 truncate font-semibold leading-tight">{booking.serviceName}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                          <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                            <Phone className="h-3 w-3" /> {booking.customerName} • {booking.customerPhone}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatPrice(booking.price)}</div>
                        <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                          ≈ {formatPriceFC(booking.price)}
                        </div>
                        <div className="mt-0.5 text-[10px] text-zinc-500">
                          acompte {formatPrice(booking.deposit)} • {booking.paymentMethod}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/50 sm:grid-cols-3">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        <div>
                          <div className="font-medium">
                            {format(new Date(booking.date), "EEE d MMM yyyy", { locale: fr })}
                          </div>
                          <div className="text-[11px] text-zinc-500">Date de prestation</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        <div>
                          <div className="font-medium">{booking.time}</div>
                          <div className="text-[11px] text-zinc-500">
                            {Math.round(booking.duration / 60)}h sur place
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                        <div>
                          <div className="max-w-[130px] truncate font-medium">{booking.city}</div>
                          <div className="text-[11px] text-zinc-500">{booking.location}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Smartphone className="h-3.5 w-3.5" />
                        {booking.providerPayoutNumber
                          ? `Acompte ${booking.paymentMethod} versé directement sur votre compte ${booking.providerPayoutMethod ?? "Mobile Money"} ${booking.providerPayoutNumber}`
                          : `Acompte reçu via ${booking.paymentMethod} sur votre compte de paiement`}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {booking.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="h-8 gap-1 bg-emerald-600 text-xs hover:bg-emerald-700"
                              onClick={() => updateBookingStatus(booking.id, "confirmed")}
                            >
                              <Check className="h-3 w-3" /> Confirmer la demande
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            >
                              <X className="h-3 w-3" /> Refuser
                            </Button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1 text-xs"
                              onClick={() => updateBookingStatus(booking.id, "completed")}
                            >
                              <CheckCheck className="h-3 w-3" /> Marquer terminée
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() => updateBookingStatus(booking.id, "cancelled")}
                            >
                              <X className="h-3 w-3" /> Annuler
                            </Button>
                          </>
                        )}
                        {booking.status === "completed" && (
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            ✓ Prestation réalisée — solde encaissé sur place
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
