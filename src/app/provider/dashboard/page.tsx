"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useProviderSpace, useProviderServices } from "@/lib/provider-context"
import { useBookings } from "@/lib/booking-context"
import { buildDemoBookings } from "@/lib/provider-demo"
import { formatPrice, formatPriceFC } from "@/lib/utils"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import { Button } from "@/components/ui/button"
import { categoryName } from "@/lib/data"
import { addDays, format, isAfter, startOfDay, subMonths } from "date-fns"
import { fr } from "date-fns/locale"
import {
  TrendingUp,
  Hourglass,
  CalendarClock,
  Wallet,
  Check,
  X,
  ArrowRight,
  Store,
  Sparkles,
  Phone,
  PartyPopper,
  Banknote,
} from "lucide-react"

const MONTHS_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]

export default function ProviderDashboardPage() {
  const { session } = useProviderSpace()
  const { bookings, addBooking, updateBookingStatus } = useBookings()
  const providerServices = useProviderServices(session ?? "")

  const providerName = session ?? ""

  const myBookings = useMemo(
    () => bookings.filter((b) => b.providerName === providerName),
    [bookings, providerName]
  )
  const active = myBookings.filter((b) => b.status !== "cancelled")
  const pending = myBookings.filter((b) => b.status === "pending")
  const today = startOfDay(new Date())
  const upcoming = active
    .filter((b) => b.status === "confirmed" && (isAfter(new Date(b.date), today) || format(new Date(b.date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd")))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  const volume = active.reduce((sum, b) => sum + b.price, 0)
  const deposits = active.reduce((sum, b) => sum + b.deposit, 0)
  const onSite = active
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.price - b.deposit), 0)

  // Revenus des 6 derniers mois (par mois de prestation)
  const monthlyRevenue: { label: string; total: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(new Date(), i)
    const total = active
      .filter((b) => {
        const d = new Date(b.date)
        return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear()
      })
      .reduce((sum, b) => sum + b.price, 0)
    monthlyRevenue.push({ label: MONTHS_SHORT[monthDate.getMonth()], total })
  }
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.total), 1)

  const handleSeed = () => {
    buildDemoBookings(providerServices).forEach((b) => addBooking(b))
  }

  if (!session) return null

  return (
    <div>
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            🤝 Espace Prestataires
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Bonjour, {session} 👋</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })} • {providerServices.length} prestation
            {providerServices.length > 1 ? "s" : ""} • {active.length} réservation{active.length > 1 ? "s" : ""}{" "}
            au total
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/provider/services">
            <Button variant="outline" size="sm" className="gap-2">
              <Store className="h-4 w-4" /> Gérer mes prestations
            </Button>
          </Link>
          <Link href="/provider/bookings">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600">
              <CalendarClock className="h-4 w-4" /> Voir les réservations
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Volume d&apos;affaires</span>
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2 text-2xl font-bold">{formatPrice(volume)}</div>
          <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">≈ {formatPriceFC(volume)}</div>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Acomptes reçus</span>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(deposits)}</div>
          <div className="text-[11px] font-medium text-zinc-500">via Mobile Money</div>
        </div>
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Solde à encaisser</span>
            <Banknote className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold">{formatPrice(onSite)}</div>
          <div className="text-[11px] font-medium text-zinc-500">sur place, le jour J</div>
        </div>
        <Link
          href="/provider/bookings"
          className={`rounded-3xl border p-5 transition-all hover:-translate-y-0.5 ${
            pending.length > 0
              ? "border-amber-300 bg-amber-50 hover:shadow-lg dark:border-amber-500/40 dark:bg-amber-500/10"
              : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Demandes en attente</span>
            <Hourglass className={`h-4 w-4 ${pending.length > 0 ? "text-amber-500" : "text-zinc-400"}`} />
          </div>
          <div className={`mt-2 text-2xl font-bold ${pending.length > 0 ? "text-amber-600 dark:text-amber-400" : ""}`}>
            {pending.length}
          </div>
          <div className="text-[11px] font-medium text-zinc-500">
            {pending.length > 0 ? "À confirmer rapidement →" : "Tout est à jour ✓"}
          </div>
        </Link>
      </div>

      {/* Empty state */}
      {myBookings.length === 0 ? (
        <div className="mt-8 rounded-[32px] border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10">
            <PartyPopper className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="mt-6 text-lg font-semibold">Aucune réservation pour l&apos;instant</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            Vos prestations sont en ligne : les clients peuvent déjà réserver. Pour explorer l&apos;espace avec
            des données réalistes, chargez un historique de démonstration (réservations passées, à venir et
            demandes en attente).
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button onClick={handleSeed} className="gap-2 bg-gradient-to-r from-amber-500 to-red-500">
              <Sparkles className="h-4 w-4" /> Charger des réservations de démo
            </Button>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                Voir ma vitrine publique
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Colonne gauche */}
          <div className="grid gap-6">
            {/* Demandes en attente */}
            {pending.length > 0 && (
              <section className="rounded-[24px] border border-amber-200 bg-white p-6 dark:border-amber-500/30 dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-semibold">
                    <Hourglass className="h-4 w-4 text-amber-500" /> Demandes à confirmer
                  </h2>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                    {pending.length}
                  </span>
                </div>
                <div className="mt-4 grid gap-3">
                  {pending.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{b.serviceName}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                          <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                            <Phone className="h-3 w-3" /> {b.customerName}
                          </span>
                          <span>
                            {format(new Date(b.date), "EEE d MMM", { locale: fr })} · {b.time}
                          </span>
                          <span>{b.city}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatPrice(b.price)}</div>
                        <div className="text-[10px] text-zinc-500">acompte {formatPrice(b.deposit)}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-8 gap-1 bg-emerald-600 text-xs hover:bg-emerald-700"
                          onClick={() => updateBookingStatus(b.id, "confirmed")}
                        >
                          <Check className="h-3 w-3" /> Confirmer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => updateBookingStatus(b.id, "cancelled")}
                        >
                          <X className="h-3 w-3" /> Refuser
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Revenus 6 mois */}
            <section className="rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold">
                  <TrendingUp className="h-4 w-4 text-zinc-400" /> Revenus des 6 derniers mois
                </h2>
                <span className="text-xs text-zinc-500">hors annulations</span>
              </div>
              <div className="mt-6 flex h-40 items-end gap-3">
                {monthlyRevenue.map((month, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-xl bg-gradient-to-t from-amber-500 to-red-400 transition-all"
                        style={{ height: `${Math.max((month.total / maxRevenue) * 100, 3)}%` }}
                        title={formatPrice(month.total)}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-zinc-500">{month.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 text-xs dark:bg-zinc-800/50">
                <span className="text-zinc-500">Meilleur mois</span>
                <span className="font-bold">
                  {formatPrice(Math.max(...monthlyRevenue.map((m) => m.total)))}
                </span>
              </div>
            </section>

            {/* Mes prestations */}
            <section className="rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold">
                  <Store className="h-4 w-4 text-zinc-400" /> Mes prestations
                </h2>
                <Link
                  href="/provider/services"
                  className="flex items-center gap-1 text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400"
                >
                  Gérer <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-4 grid gap-3">
                {providerServices.map((service) => {
                  const count = active.filter((b) => b.serviceId === service.id).length
                  const revenue = active
                    .filter((b) => b.serviceId === service.id)
                    .reduce((sum, b) => sum + b.price, 0)
                  return (
                    <Link
                      key={service.id}
                      href="/provider/services"
                      className="flex items-center gap-4 rounded-2xl border border-zinc-100 p-3 transition-all hover:border-amber-200 hover:bg-amber-50/40 dark:border-zinc-800 dark:hover:border-amber-500/30 dark:hover:bg-amber-500/5"
                    >
                      <img
                        src={service.image}
                        alt={service.name}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{service.name}</div>
                        <div className="mt-0.5 text-xs text-zinc-500">
                          {categoryName(service.category)} • {count} réservation{count > 1 ? "s" : ""} •{" "}
                          {formatPrice(revenue)}
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          service.paused
                            ? "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        }`}
                      >
                        {service.paused ? "En pause" : "En ligne"}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          </div>

          {/* Colonne droite : prochaines prestations */}
          <section className="rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <CalendarClock className="h-4 w-4 text-zinc-400" /> Prochaines prestations
              </h2>
              <Link href="/provider/agenda" className="text-xs font-semibold text-amber-600 hover:underline dark:text-amber-400">
                Agenda
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
                Aucune prestation confirmée à venir pour le moment.
              </p>
            ) : (
              <div className="relative mt-5 grid gap-5">
                {upcoming.slice(0, 5).map((b) => {
                  const date = new Date(b.date)
                  const isSoon = b.date <= format(addDays(new Date(), 7), "yyyy-MM-dd")
                  return (
                    <div key={b.id} className="flex gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ${
                          isSoon
                            ? "bg-gradient-to-br from-amber-500 to-red-500 text-white"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}
                      >
                        <span className="text-lg font-bold leading-none">{format(date, "d")}</span>
                        <span className="mt-0.5 text-[10px] font-medium uppercase">
                          {format(date, "MMM", { locale: fr })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{b.serviceName}</div>
                        <div className="mt-1 text-xs text-zinc-500">
                          {b.time} • {b.customerName}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <BookingStatusBadge status={b.status} />
                          <span className="text-xs font-bold">{formatPrice(b.price)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {upcoming.length > 0 && (
              <Link
                href="/provider/agenda"
                className="mt-5 flex items-center justify-center gap-1 rounded-full border border-zinc-200 py-2.5 text-xs font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
              >
                Voir tout l&apos;agenda <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
