"use client"

import { useBookings } from "@/lib/booking-context"
import { formatPrice } from "@/lib/utils"
import { Calendar, Clock, MapPin, X, Check, Sparkles, ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function BookingsPage() {
  const { bookings, cancelBooking } = useBookings()
  const active = bookings.filter(b => b.status !== 'cancelled')
  const cancelled = bookings.filter(b => b.status === 'cancelled')

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes réservations</h1>
            <p className="mt-1 text-sm text-zinc-500">{active.length} active{active.length !== 1 ? 's' : ''} • {bookings.length} au total</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" /> Nouvelle réservation
            </Button>
          </Link>
        </div>

        {active.length === 0 ? (
          <div className="mt-12 rounded-[32px] border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Calendar className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-6 text-lg font-semibold">Aucune réservation pour le moment</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-500">
              Découvrez nos prestataires vérifiés et réservez en 30 secondes. Confirmation instantanée.
            </p>
            <Link href="/" className="mt-6 inline-flex">
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" /> Découvrir les services <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {active.map(booking => (
              <div key={booking.id} className="group flex flex-col overflow-hidden rounded-[24px] border border-zinc-200 bg-white transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row">
                <div className="relative h-48 w-full shrink-0 sm:h-auto sm:w-64">
                  <img src={booking.serviceImage} alt={booking.serviceName} className="h-full w-full object-cover" />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-xs font-semibold shadow-sm dark:bg-zinc-800/90">
                    {booking.status === 'confirmed' ? (
                      <span className="flex items-center gap-1 text-emerald-600"><Check className="h-3 w-3" /> Confirmé</span>
                    ) : (
                      <span>{booking.status}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold leading-tight">{booking.serviceName}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                        <img src={`https://i.pravatar.cc/100?img=${Math.floor(Math.random()*20)+1}`} className="h-4 w-4 rounded-full" alt="" />
                        {booking.providerName} • {booking.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatPrice(booking.price)}</div>
                      <div className="text-xs text-zinc-500">{booking.duration} min</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-800/50 sm:grid-cols-3">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800"><Calendar className="h-3.5 w-3.5" /></div>
                      <div>
                        <div className="font-medium">{format(new Date(booking.date), 'EEE d MMM', { locale: fr })}</div>
                        <div className="text-[11px] text-zinc-500">Date</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800"><Clock className="h-3.5 w-3.5" /></div>
                      <div>
                        <div className="font-medium">{booking.time}</div>
                        <div className="text-[11px] text-zinc-500">Heure</div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-xs sm:col-span-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800"><MapPin className="h-3.5 w-3.5" /></div>
                      <div>
                        <div className="font-medium truncate max-w-[120px]">{booking.location}</div>
                        <div className="text-[11px] text-zinc-500">Lieu</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="text-xs text-zinc-500">
                      Réservé le {format(new Date(booking.createdAt), 'd MMM à HH:mm', { locale: fr })} • ID #{booking.id.toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-8 text-xs">Modifier</Button>
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
            ))}
          </div>
        )}

        {cancelled.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-semibold text-zinc-500">Annulées • {cancelled.length}</h2>
            <div className="mt-3 grid gap-3 opacity-60">
              {cancelled.map(b => (
                <div key={b.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <span>{b.serviceName} • {b.date} {b.time}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">Annulé</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 rounded-[24px] bg-zinc-900 p-6 text-white dark:bg-white dark:text-black">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 dark:bg-black/10"><Sparkles className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">Besoin d'aide ?</div>
                <div className="text-sm text-white/60 dark:text-black/60">Support 24/7 • Réponse en moins de 2 minutes</div>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="bg-white text-black hover:bg-zinc-100 dark:bg-black dark:text-white">Contacter le support</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
