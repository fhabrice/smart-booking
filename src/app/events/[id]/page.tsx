"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useBookings } from "@/lib/booking-context"
import { categoryName, checklistFor, eventTypeOf } from "@/lib/data"
import { useMergedServices } from "@/lib/provider-context"
import { ServiceCard } from "@/components/service-card"
import { Button } from "@/components/ui/button"
import { formatPrice, formatPriceFC, cn, bookingReference } from "@/lib/utils"
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Wallet,
  Check,
  Circle,
  Plus,
  Trash2,
  Clock,
  PartyPopper,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const { getEvent, getEventBookings, eventBudgetUsed, cancelBooking, mounted } = useBookings()
  const allServices = useMergedServices()
  const event = getEvent(params.id as string)
  const [selectedCat, setSelectedCat] = useState<string | null>(null)

  if (!mounted) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-zinc-400">Chargement…</div>
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <div className="text-5xl">🎪</div>
        <h1 className="mt-4 text-2xl font-bold">Cérémonie introuvable</h1>
        <p className="mt-2 text-sm text-zinc-500">Créez votre cérémonie pour accéder à votre tableau de bord.</p>
        <Link href="/events/new" className="mt-6 inline-flex">
          <Button className="gap-2 bg-gradient-to-r from-amber-500 to-red-500">
            <Plus className="h-4 w-4" /> Créer une cérémonie
          </Button>
        </Link>
      </div>
    )
  }

  const type = eventTypeOf(event.type)
  const checklist = checklistFor(event.type)
  const bookings = getEventBookings(event.id)
  const used = eventBudgetUsed(event.id)

  const reservedCats = new Set(bookings.map((b) => b.serviceCategory))
  const doneCount = checklist.filter((c) => reservedCats.has(c.category)).length
  const progress = Math.round((doneCount / checklist.length) * 100)
  const budgetPct = event.budget > 0 ? Math.min(Math.round((used / event.budget) * 100), 100) : 0

  const focusCat = selectedCat ?? checklist.find((c) => !reservedCats.has(c.category))?.category ?? "all"
  const recommendations = allServices
    .filter((s) => s.category === focusCat && !s.paused)
    .sort((a, b) => (a.city === event.city ? -1 : 0) - (b.city === event.city ? -1 : 0))

  const timeline = [...bookings].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" /> Accueil
        </Link>

        {/* Header event */}
        <div className="mt-6 overflow-hidden rounded-[28px] bg-zinc-900 p-6 text-white dark:bg-zinc-800 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <span>{type?.icon}</span> {type?.label} • RÉF. {bookingReference(event.id)}
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{event.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {format(new Date(event.date), "EEEE d MMMM yyyy", { locale: fr })} · {event.time}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {event.city} · {event.venue}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" /> {event.guests} invités
                </span>
              </div>
              {event.notes && <p className="mt-3 max-w-xl text-sm italic text-white/50">« {event.notes} »</p>}
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-[11px] uppercase tracking-wide text-white/50">Budget</div>
              <div className="mt-1 text-2xl font-bold">{formatPrice(event.budget)}</div>
              <div className="text-[11px] text-amber-300">≈ {formatPriceFC(event.budget)}</div>
              <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-white/15">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    budgetPct >= 100 ? "bg-red-400" : "bg-gradient-to-r from-amber-400 to-emerald-400"
                  )}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <div className="mt-1.5 text-[11px] text-white/60">
                {formatPrice(used)} engagés ({budgetPct}%)
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Prestations réservées</span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                {doneCount}/{checklist.length}
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {progress === 100 ? "🎉 Tout est réservé, il n'y a plus qu'à danser !" : `${progress}% de votre cérémonie est bouclée`}
            </p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Total engagé</span>
              <Wallet className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold">{formatPrice(used)}</div>
            <div className="text-xs font-medium text-amber-700 dark:text-amber-400">≈ {formatPriceFC(used)}</div>
            <p className="mt-1 text-xs text-zinc-500">sur {formatPrice(event.budget)} de budget</p>
          </div>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Invités & repas</span>
              <Users className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold">{event.guests}</div>
            <p className="mt-1 text-xs text-zinc-500">
              Buffet estimé : {formatPrice(event.guests * 12)} ≈ {formatPriceFC(event.guests * 12)} (12$/invité)
            </p>
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Checklist des prestations</h2>
            <Link href="/bookings" className="text-sm font-medium text-zinc-500 hover:underline">
              Voir toutes mes réservations
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {checklist.map((item) => {
              const catBookings = bookings.filter((b) => b.serviceCategory === item.category)
              const done = catBookings.length > 0
              const isFocus = focusCat === item.category
              return (
                <button
                  key={item.category}
                  onClick={() => setSelectedCat(item.category)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-4 text-left transition-all",
                    done
                      ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20"
                      : "border-zinc-200 bg-white hover:border-amber-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-500/50",
                    isFocus && "ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-zinc-950"
                  )}
                >
                  {done ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-zinc-300 text-zinc-400 dark:border-zinc-600">
                      <Circle className="h-3 w-3" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{item.label}</div>
                    {done ? (
                      <div className="truncate text-xs text-emerald-700 dark:text-emerald-400">
                        ✓ {catBookings[0].serviceName} · {formatPrice(catBookings[0].price)}
                      </div>
                    ) : (
                      <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Plus className="h-3 w-3" /> Réserver maintenant
                      </div>
                    )}
                  </div>
                  {catBookings.length > 1 && (
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      +{catBookings.length - 1}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Recommandé pour votre cérémonie {type?.icon}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {focusCat === "all" ? "Tous les prestataires" : categoryName(focusCat)} • prestataires de{" "}
                <strong>{event.city}</strong> en premier
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {checklist.map((c) => (
                <button
                  key={c.category}
                  onClick={() => setSelectedCat(c.category)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    focusCat === c.category
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  )}
                >
                  {categoryName(c.category)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* Bookings of this event */}
        {bookings.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold tracking-tight">
              Prestations réservées pour cette cérémonie • {bookings.length}
            </h2>

            {/* Timeline jour J */}
            <div className="mt-4 rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-amber-500" /> Déroulé du jour J
              </div>
              <div className="mt-4 space-y-0">
                {timeline.map((b, i) => (
                  <div key={b.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {i < timeline.length - 1 && (
                      <div className="absolute left-[13px] top-7 h-full w-px bg-zinc-200 dark:bg-zinc-700" />
                    )}
                    <div className="z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      {b.time.slice(0, 2)}
                    </div>
                    <div className="flex flex-1 items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">
                          {b.time} — {b.serviceName}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {b.providerName} · {b.location}
                        </div>
                      </div>
                      <div className="shrink-0 text-sm font-bold">{formatPrice(b.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cards */}
            <div className="mt-4 grid gap-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center"
                >
                  <div className="h-24 w-full shrink-0 overflow-hidden sm:h-20 sm:w-32">
                    <img src={b.serviceImage} alt={b.serviceName} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{b.serviceName}</div>
                      <div className="mt-0.5 text-xs text-zinc-500">
                        {format(new Date(b.date), "d MMM", { locale: fr })} à {b.time} • {b.providerName}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatPrice(b.price)}</div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-400">acompte {formatPrice(b.deposit)} payé</div>
                      </div>
                      <button
                        onClick={() => cancelBooking(b.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-500 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                        title="Annuler"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-[24px] bg-zinc-900 p-6 text-white dark:bg-white dark:text-black">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 dark:bg-black/10">
                <PartyPopper className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold">
                  {doneCount === checklist.length ? "Votre cérémonie est complète ! 🎉" : `Plus que ${checklist.length - doneCount} prestation(s) à réserver`}
                </div>
                <div className="text-sm text-white/60 dark:text-black/60">
                  Continuez à compléter votre checklist — tout est centralisé ici.
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-black hover:bg-zinc-100 dark:bg-black dark:text-white"
              onClick={() => router.push("/")}
            >
              Voir tous les prestataires
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
