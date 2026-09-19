"use client"

import { useBookings } from "@/lib/booking-context"
import { formatPrice, formatPriceFC, bookingReference } from "@/lib/utils"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import { Calendar, Clock, MapPin, X, Sparkles, ArrowRight, Search, Smartphone, PartyPopper, Phone } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { categoryName } from "@/lib/data"

export default function BookingsPage() {
  const { bookings, cancelBooking, getEvent, events } = useBookings()
  const active = bookings.filter((b) => b.status !== "cancelled")
  const cancelled = bookings.filter((b) => b.status === "cancelled")
  const totalSpent = active.reduce((sum, b) => sum + b.price, 0)
  const totalDeposits = active.reduce((sum, b) => sum + b.deposit, 0)

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes réservations</h1>
            <p className="mt-1 text-sm text-zinc-500">
              {active.length} active{active.length !== 1 ? "s" : ""} • {bookings.length} au total •{" "}
              {events.length} cérémonie{events.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            {events.length > 0 && (
              <Link href={`/events/${events[0].id}`}>
                <Button variant="outline" className="gap-2">
                  <PartyPopper className="h-4 w-4" /> Ma cérémonie
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button className="gap-2 bg-gradient-to-r from-amber-500 to-red-500">
                <Search className="h-4 w-4" /> Nouvelle réservation
              </Button>
            </Link>
          </div>
        </div>

        {active.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-xs font-medium text-zinc-500">Total engagements</div>
              <div className="mt-1 text-xl font-bold">{formatPrice(totalSpent)}</div>
              <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">≈ {formatPriceFC(totalSpent)}</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-xs font-medium text-zinc-500">Acomptes à payer</div>
              <div className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(totalDeposits)}</div>
              <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">≈ {formatPriceFC(totalDeposits)}</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:col-span-1">
              <div className="text-xs font-medium text-zinc-500">Solde sur place</div>
              <div className="mt-1 text-xl font-bold">{formatPrice(totalSpent - totalDeposits)}</div>
              <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">≈ {formatPriceFC(totalSpent - totalDeposits)}</div>
            </div>
          </div>
        )}

        {active.length === 0 ? (
          <div className="mt-12 rounded-[32px] border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Calendar className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">Aucune réservation pour le moment</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
              Créez votre cérémonie ou réservez directement un prestataire vérifié. Confirmation instantanée, acompte en Mobile Money.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link href="/events/new" className="inline-flex">
                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-red-500">
                  <PartyPopper className="h-4 w-4" /> Organiser une cérémonie <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/" className="inline-flex">
                <Button variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4" /> Voir les prestataires
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {active.map((booking) => {
              const event = booking.eventId ? getEvent(booking.eventId) : undefined
              return (
                <div
                  key={booking.id}
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-zinc-200 bg-white transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row"
                >
                  <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-56">
                    <img src={booking.serviceImage} alt={booking.serviceName} className="h-full w-full object-cover" />
                    <div className="absolute left-3 top-3">
                      <BookingStatusBadge status={booking.status} className="shadow-sm" />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {event && (
                          <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                            <PartyPopper className="h-3 w-3" /> {event.title}
                          </div>
                        )}
                        <h3 className="font-semibold leading-tight">{booking.serviceName}</h3>
                        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">{booking.providerName}</span>
                          <span>•</span>
                          <span>
                            {booking.city} · {booking.location}
                          </span>
                          <span>•</span>
                          <span className="uppercase tracking-wide">{categoryName(booking.serviceCategory)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{formatPrice(booking.price)}</div>
                        <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">≈ {formatPriceFC(booking.price)}</div>
                        <div className="mt-0.5 text-[10px] text-zinc-500">
                          acompte {formatPrice(booking.deposit)} · {booking.paymentMethod}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/50 sm:grid-cols-4">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800">
                          <Calendar className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-medium">{format(new Date(booking.date), "EEE d MMM", { locale: fr })}</div>
                          <div className="text-[11px] text-zinc-500">Date</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="font-medium">{booking.time}</div>
                          <div className="text-[11px] text-zinc-500">Heure</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="max-w-[110px] truncate font-medium">{booking.city}</div>
                          <div className="text-[11px] text-zinc-500">Ville</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800">
                          <Phone className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="max-w-[110px] truncate font-medium">{booking.customerPhone}</div>
                          <div className="text-[11px] text-zinc-500">{booking.customerName}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Smartphone className="h-3.5 w-3.5" /> Payé via {booking.paymentMethod} • RÉF.{" "}
                        <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                          {bookingReference(booking.id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {event && (
                          <Link href={`/events/${event.id}`}>
                            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                              <PartyPopper className="h-3 w-3" /> Cérémonie
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          <X className="h-3 w-3" /> Annuler
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {cancelled.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-semibold text-zinc-500">Annulées • {cancelled.length}</h2>
            <div className="mt-3 grid gap-3 opacity-60">
              {cancelled.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span>
                    {b.serviceName} • {b.date} {b.time}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">Annulé</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 rounded-[24px] bg-zinc-900 p-6 text-white dark:bg-white dark:text-black">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 dark:bg-black/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">Besoin d&apos;aide ?</div>
                <div className="text-sm text-white/60 dark:text-black/60">
                  Support WhatsApp 24/7 • Réponse en moins de 5 minutes
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-black hover:bg-zinc-100 dark:bg-black dark:text-white"
            >
              Contacter le support
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
