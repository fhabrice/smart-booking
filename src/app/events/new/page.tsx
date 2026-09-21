"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { eventTypes, cities, checklistFor } from "@/lib/data"
import { useBookings } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { ArrowRight, CalendarDays, MapPin, Users, Wallet, StickyNote, Clock } from "lucide-react"
import { BOOKING_HORIZON_MONTHS, clampToBookableRange, cn, isoDay, maxBookableDate, minBookableDate } from "@/lib/utils"
import { format, addDays } from "date-fns"
import { fr } from "date-fns/locale"

function NewEventContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addEvent } = useBookings()

  const [type, setType] = useState(searchParams.get("type") ?? "mariage")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"))
  const [time, setTime] = useState("10:00")
  const [city, setCity] = useState("Kinshasa")
  const [venue, setVenue] = useState("")
  const [guests, setGuests] = useState(150)
  const [budget, setBudget] = useState(3000)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const selectedType = eventTypes.find((t) => t.id === type)
  const checklist = checklistFor(type)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const event = await addEvent({
        type,
        title: title.trim() || `${selectedType?.label ?? "Cérémonie"} du ${format(new Date(date), "d MMMM", { locale: fr })}`,
        date,
        time,
        city,
        venue: venue.trim() || "Lieu à confirmer",
        guests,
        budget,
        notes,
      })
      router.push(`/events/${event.id}`)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-zinc-900 py-12 text-white dark:bg-zinc-800">
        <div className="absolute inset-0 -z-0 opacity-20">
          <img src="/images/hero.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
              🎊 Planificateur de cérémonie
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Organisez votre cérémonie en 2 minutes</h1>
            <p className="mt-3 text-sm text-white/70 sm:text-base">
              Décrivez votre événement — on génère votre checklist de prestataires, votre budget et votre déroulé du jour J.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Type */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">1 · Type de cérémonie</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {eventTypes.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  "rounded-3xl border p-4 text-center transition-all",
                  type === t.id
                    ? "border-amber-500 bg-amber-50 shadow-md dark:border-amber-500 dark:bg-amber-500/10"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
                )}
              >
                <div className="text-3xl">{t.icon}</div>
                <div className="mt-2 text-sm font-semibold">{t.label}</div>
                <div className="mt-0.5 text-[11px] text-zinc-500">{t.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Details */}
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">2 · Les détails</h2>
          <div className="mt-4 space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <label className="text-xs font-semibold text-zinc-500">Nom de la cérémonie</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Ex : ${selectedType?.label} de Chantal & Patrick`}
                className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                  <CalendarDays className="h-3.5 w-3.5" /> Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={isoDay(minBookableDate())}
                  max={isoDay(maxBookableDate())}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value) setDate(clampToBookableRange(value))
                  }}
                  className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:[color-scheme:dark]"
                />
                <p className="mt-1.5 text-[11px] text-zinc-400">
                  Planification sur {BOOKING_HORIZON_MONTHS} mois, jusqu&apos;au{" "}
                  {format(maxBookableDate(), "d MMMM yyyy", { locale: fr })}
                </p>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                  <Clock className="h-3.5 w-3.5" /> Heure de début
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:[&>option]:bg-zinc-900"
                >
                  {Array.from({ length: 30 }, (_, i) => {
                    const h = 6 + Math.floor(i / 2)
                    const m = i % 2 === 0 ? "00" : "30"
                    if (h > 22) return null
                    const label = `${h.toString().padStart(2, "0")}:${m}`
                    return (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                  <MapPin className="h-3.5 w-3.5" /> Ville
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:[&>option]:bg-zinc-900"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.province})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500">Lieu / commune</label>
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Ex : Salle dans Gombe, av. du 24 novembre"
                  className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                  <Users className="h-3.5 w-3.5" /> Nombre d&apos;invités
                </label>
                <input
                  type="number"
                  min={10}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                  <Wallet className="h-3.5 w-3.5" /> Budget total (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                  className="mt-1.5 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500">
                <StickyNote className="h-3.5 w-3.5" /> Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Ex : cérémonie civile le matin à la mairie de Gombe, réception l'après-midi. Thème bleu & or."
                className="mt-1.5 w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              />
            </div>
          </div>
        </section>

        {/* Checklist preview */}
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            3 · Ce que vous devrez réserver ({checklist.length} prestations)
          </h2>
          <div className="mt-4 grid gap-2 rounded-3xl border border-dashed border-amber-300 bg-amber-50/50 p-5 dark:border-amber-500/40 dark:bg-amber-500/5 sm:grid-cols-2">
            {checklist.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 dark:bg-zinc-900">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                  {i + 1}
                </div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="sticky bottom-4 mt-8">
          <Button
            onClick={handleSubmit}
            disabled={loading || !date || guests < 1}
            size="lg"
            className="w-full gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-red-500 text-base shadow-xl shadow-amber-500/25 hover:from-amber-600 hover:to-red-600"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Création…
              </>
            ) : (
              <>
                Créer ma cérémonie {selectedType?.icon} <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function NewEventPage() {
  return (
    <Suspense>
      <NewEventContent />
    </Suspense>
  )
}
