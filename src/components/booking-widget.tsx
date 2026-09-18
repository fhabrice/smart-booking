"use client"

import { useState } from "react"
import { Service } from "@/lib/types"
import { formatPrice, formatPriceFC, generateTimeSlots, bookingReference } from "@/lib/utils"
import { Button } from "./ui/button"
import { Calendar, Clock, Check, Shield, Smartphone, PartyPopper, User, Phone } from "lucide-react"
import { format, addDays, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useBookings } from "@/lib/booking-context"
import { paymentMethods } from "@/lib/data"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function BookingWidget({ service, defaultEventId }: { service: Service; defaultEventId?: string }) {
  const router = useRouter()
  const { addBooking, isSlotBooked, events } = useBookings()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [eventId, setEventId] = useState<string>(defaultEventId ?? "")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [payment, setPayment] = useState("mpesa")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
  const timeSlots = generateTimeSlots()
  const dateStr = format(selectedDate, "yyyy-MM-dd")

  const deposit = Math.round(service.price * 0.5)

  const handleBooking = async () => {
    if (!selectedTime || !name || phone.length < 8) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    const booking = addBooking({
      eventId: eventId || undefined,
      serviceId: service.id,
      serviceName: service.name,
      serviceImage: service.image,
      serviceCategory: service.category,
      date: dateStr,
      time: selectedTime,
      duration: service.duration,
      price: service.price,
      deposit,
      paymentMethod: paymentMethods.find((p) => p.id === payment)?.name ?? "M-Pesa",
      customerName: name,
      customerPhone: phone,
      providerName: service.provider.name,
      location: service.location,
      city: service.city,
    })
    setLoading(false)
    setSuccess(booking.id)
    setTimeout(() => router.push("/bookings"), 1600)
  }

  if (success) {
    return (
      <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Réservation confirmée ! 🎉</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Acompte de {formatPrice(deposit)} ({formatPriceFC(deposit)}) à payer via{" "}
          {paymentMethods.find((p) => p.id === payment)?.name} au {phone}.
        </p>
        <div className="mt-3 rounded-xl bg-white px-4 py-2 font-mono text-sm font-bold dark:bg-zinc-900">
          {bookingReference(success)}
        </div>
        <p className="mt-3 text-xs text-zinc-500">Redirection vers vos réservations…</p>
      </div>
    )
  }

  return (
    <div className="sticky top-24 rounded-[24px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/30 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight">{formatPrice(service.price)}</span>
              <span className="text-sm text-zinc-500">{service.priceUnit}</span>
            </div>
            <div className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">≈ {formatPriceFC(service.price)}</div>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            ⚡ Réponse immédiate
          </div>
        </div>

        {/* Date picker */}
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4" /> Date de la cérémonie
          </h4>
          <div className="grid grid-cols-7 gap-1.5">
            {dates.map((date, i) => {
              const isSelected = isSameDay(date, selectedDate)
              const isToday = i === 0
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center rounded-2xl border p-2 text-xs transition-all ${
                    isSelected
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-zinc-100 bg-zinc-50 hover:border-zinc-200 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className={`text-[10px] uppercase ${isSelected ? "text-white/70 dark:text-black/60" : "text-zinc-500"}`}>
                    {format(date, "EEE", { locale: fr })}
                  </span>
                  <span className="mt-1 text-sm font-bold">{format(date, "d")}</span>
                  {isToday && (
                    <span className={`mt-1 h-1 w-1 rounded-full ${isSelected ? "bg-white dark:bg-black" : "bg-amber-500"}`} />
                  )}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-center text-xs font-medium text-zinc-500">
            {format(selectedDate, "EEEE d MMMM", { locale: fr })}
          </p>
        </div>

        {/* Time slots */}
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4" /> Heure d'intervention
          </h4>
          <div className="grid max-h-[140px] grid-cols-4 gap-2 overflow-y-auto pr-1">
            {timeSlots.map((time) => {
              const booked = isSlotBooked(dateStr, time, service.id)
              const isSelected = selectedTime === time
              return (
                <button
                  key={time}
                  disabled={booked}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "rounded-full border px-2 py-2 text-xs font-medium transition-all",
                    booked
                      ? "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300 dark:border-zinc-800 dark:bg-zinc-800/30 dark:text-zinc-600"
                      : isSelected
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-md dark:border-white dark:bg-white dark:text-black"
                        : "border-zinc-200 bg-white hover:border-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                  )}
                >
                  {time}
                </button>
              )
            })}
          </div>
        </div>

        {/* Event link */}
        {events.length > 0 && selectedTime && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <PartyPopper className="h-4 w-4" /> Rattacher à ma cérémonie
            </h4>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:[&>option]:bg-zinc-900"
            >
              <option value="">Réservation seule (sans cérémonie)</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} — {format(new Date(ev.date), "d MMM yyyy", { locale: fr })}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Customer info */}
        {selectedTime && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="mb-3 text-sm font-semibold">Vos informations</h4>
            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nom complet"
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 pl-11 pr-4 text-sm font-medium placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:focus:bg-zinc-900"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+243 8xx xxx xxx"
                  type="tel"
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 py-2.5 pl-11 pr-4 text-sm font-medium placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:focus:bg-zinc-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Payment */}
        {selectedTime && phone.length >= 8 && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Smartphone className="h-4 w-4" /> Paiement Mobile Money
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setPayment(pm.id)}
                  className={cn(
                    "rounded-2xl border p-3 text-center transition-all",
                    payment === pm.id
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
                  )}
                >
                  <div className="text-xs font-bold">{pm.name}</div>
                  <div className={cn("mt-1 text-[10px]", payment === pm.id ? "text-white/60 dark:text-black/60" : "text-zinc-400")}>
                    {pm.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedTime && phone.length >= 8 && (
          <div className="mt-6 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Prestation</span>
                <span className="max-w-[60%] truncate text-right font-medium">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & heure</span>
                <span className="font-medium">
                  {format(selectedDate, "d MMM", { locale: fr })} à {selectedTime}
                </span>
              </div>
              <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {formatPrice(service.price)} <span className="text-xs font-normal text-amber-700 dark:text-amber-400">≈ {formatPriceFC(service.price)}</span>
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Acompte maintenant (50%)</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(deposit)} · {formatPriceFC(deposit)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Solde sur place</span>
                <span className="font-medium">
                  {formatPrice(service.price - deposit)} · {formatPriceFC(service.price - deposit)}
                </span>
              </div>
            </div>
          </div>
        )}

        <Button
          disabled={!selectedTime || !name || phone.length < 8 || loading}
          onClick={handleBooking}
          className="mt-6 w-full gap-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600"
          size="lg"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Confirmation…
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Réserver • acompte {formatPrice(deposit)}
            </>
          )}
        </Button>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Smartphone className="h-3 w-3" /> M-Pesa · Orange · Airtel
          </span>
          <span>•</span>
          <span>Annulation gratuite 72h avant</span>
        </div>
      </div>
    </div>
  )
}
