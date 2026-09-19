"use client"

import { useMemo, useState } from "react"
import { useProviderSpace } from "@/lib/provider-context"
import { useBookings } from "@/lib/booking-context"
import { formatPrice, bookingReference, cn } from "@/lib/utils"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import { Button } from "@/components/ui/button"
import { addDays, format, isBefore, startOfDay } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarClock, Phone, MapPin, Clock, PartyPopper, ChevronDown } from "lucide-react"
import Link from "next/link"

export default function ProviderAgendaPage() {
  const { session } = useProviderSpace()
  const { bookings, events } = useBookings()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showPast, setShowPast] = useState(false)

  const myBookings = useMemo(
    () => bookings.filter((b) => b.providerName === session && b.status !== "cancelled"),
    [bookings, session]
  )

  const today = startOfDay(new Date())
  const days = Array.from({ length: 30 }, (_, i) => addDays(today, i))

  const upcoming = myBookings
    .filter((b) => !isBefore(new Date(b.date), today))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  const past = myBookings
    .filter((b) => isBefore(new Date(b.date), today))
    .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time))

  const visible = selectedDate ? upcoming.filter((b) => b.date === selectedDate) : upcoming

  // Grouper par date
  const grouped: Array<[string, typeof visible]> = []
  {
    const map = new Map<string, typeof visible>()
    for (const b of visible) {
      const list = map.get(b.date) ?? []
      list.push(b)
      map.set(b.date, list)
    }
    grouped.push(...Array.from(map.entries()))
  }

  if (!session) return null

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Agenda des prestations</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {upcoming.length} prestation{upcoming.length > 1 ? "s" : ""} à venir sur les 30 prochains jours •{" "}
            {past.length} réalisée{past.length > 1 ? "s" : ""}
          </p>
        </div>
        {selectedDate && (
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(null)}>
            Voir toutes les dates
          </Button>
        )}
      </div>

      {/* Bandeau 30 jours */}
      <div className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-10">
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd")
            const dayBookings = upcoming.filter((b) => b.date === dateStr)
            const hasPending = dayBookings.some((b) => b.status === "pending")
            const isToday = dateStr === format(today, "yyyy-MM-dd")
            const isSelected = selectedDate === dateStr
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                disabled={dayBookings.length === 0}
                className={cn(
                  "flex flex-col items-center rounded-2xl border px-1 py-2 transition-all",
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                    : dayBookings.length > 0
                      ? "border-amber-200 bg-amber-50 hover:border-amber-400 dark:border-amber-500/30 dark:bg-amber-500/10"
                      : "border-zinc-100 dark:border-zinc-800/60",
                  dayBookings.length === 0 && "cursor-default opacity-50"
                )}
              >
                <span
                  className={cn(
                    "text-[9px] font-semibold uppercase",
                    isSelected ? "text-white/70 dark:text-black/60" : "text-zinc-400"
                  )}
                >
                  {format(day, "EEE", { locale: fr })}
                </span>
                <span className="mt-0.5 text-sm font-bold">{format(day, "d")}</span>
                <span className="mt-1 flex h-3 items-center gap-0.5">
                  {dayBookings.length === 0 ? (
                    <span className="h-1 w-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                  ) : (
                    Array.from({ length: Math.min(dayBookings.length, 3) }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isSelected
                            ? "bg-white dark:bg-black"
                            : hasPending
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                        )}
                      />
                    ))
                  )}
                </span>
                {isToday && !isSelected && <span className="mt-0.5 text-[8px] font-bold text-amber-600">AUJ.</span>}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 px-1 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> En attente de confirmation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Confirmée
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" /> Jour libre
          </span>
        </div>
      </div>

      {/* Liste */}
      {grouped.length === 0 ? (
        <div className="mt-8 rounded-[32px] border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <CalendarClock className="h-7 w-7 text-zinc-400" />
          </div>
          <h3 className="mt-5 font-semibold">
            {selectedDate ? "Aucune prestation ce jour-là" : "Agenda libre"}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
            {selectedDate
              ? "Choisissez un autre jour ou consultez toutes les dates."
              : "Les nouvelles réservations s'ajouteront automatiquement à votre agenda."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-8">
          {grouped.map(([dateStr, dayBookings]) => {
            const date = new Date(dateStr)
            const isToday = dateStr === format(today, "yyyy-MM-dd")
            return (
              <div key={dateStr}>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl",
                      isToday
                        ? "bg-gradient-to-br from-amber-500 to-red-500 text-white"
                        : "bg-zinc-900 text-white dark:bg-zinc-800"
                    )}
                  >
                    <span className="text-base font-bold leading-none">{format(date, "d")}</span>
                    <span className="text-[9px] font-medium uppercase">{format(date, "MMM", { locale: fr })}</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold capitalize">
                      {format(date, "EEEE d MMMM yyyy", { locale: fr })}
                      {isToday && <span className="ml-2 text-amber-600">• Aujourd&apos;hui</span>}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      {dayBookings.length} prestation{dayBookings.length > 1 ? "s" : ""} •{" "}
                      {formatPrice(dayBookings.reduce((sum, b) => sum + b.price, 0))} au total
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 border-l-2 border-dashed border-zinc-200 pl-6 dark:border-zinc-800 ml-6">
                  {dayBookings.map((b) => {
                    const event = b.eventId ? events.find((e) => e.id === b.eventId) : undefined
                    return (
                      <div
                        key={b.id}
                        className="rounded-[20px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold text-white dark:bg-zinc-800">
                              {b.time}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold">{b.serviceName}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {b.customerName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {b.city}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {Math.round(b.duration / 60)}h
                                </span>
                                {event && (
                                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                    <PartyPopper className="h-3 w-3" /> {event.title}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm font-bold">{formatPrice(b.price)}</div>
                              <div className="font-mono text-[10px] text-zinc-400">{bookingReference(b.id)}</div>
                            </div>
                            <BookingStatusBadge status={b.status} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Historique */}
      {past.length > 0 && !selectedDate && (
        <div className="mt-10">
          <button
            onClick={() => setShowPast(!showPast)}
            className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm font-semibold transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
          >
            <span className="capitalize">
              Prestations passées ({past.length}) • {formatPrice(past.reduce((sum, b) => sum + b.price, 0))}
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showPast && "rotate-180")} />
          </button>
          {showPast && (
            <div className="mt-3 grid gap-2">
              {past.slice(0, 12).map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-100 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {format(new Date(b.date), "d MMM yy", { locale: fr })}
                    </span>
                    <span className="truncate font-medium">{b.serviceName}</span>
                    <span className="hidden truncate text-zinc-500 sm:inline">{b.customerName}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-bold">{formatPrice(b.price)}</span>
                    <BookingStatusBadge status={b.status} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <Link
          href="/provider/bookings"
          className="text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
        >
          Gérer toutes les réservations →
        </Link>
      </div>
    </div>
  )
}
