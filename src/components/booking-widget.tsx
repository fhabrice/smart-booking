"use client"

import { useState } from "react"
import { Service } from "@/lib/types"
import { formatPrice, generateTimeSlots } from "@/lib/utils"
import { Button } from "./ui/button"
import { Calendar, Clock, Check, Sparkles, Shield, CreditCard } from "lucide-react"
import { format, addDays, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useBookings } from "@/lib/booking-context"
import { useRouter } from "next/navigation"

export function BookingWidget({ service }: { service: Service }) {
  const router = useRouter()
  const { addBooking, isSlotBooked } = useBookings()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
  const timeSlots = generateTimeSlots()
  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const handleBooking = async () => {
    if (!selectedTime || !name || !email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    addBooking({
      serviceId: service.id,
      serviceName: service.name,
      serviceImage: service.image,
      date: dateStr,
      time: selectedTime,
      duration: service.duration,
      price: service.price,
      providerName: service.provider.name,
      location: service.location,
      customerName: name,
      customerEmail: email
    })
    setLoading(false)
    setSuccess(true)
    setTimeout(() => router.push('/bookings'), 1200)
  }

  if (success) {
    return (
      <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white">
          <Check className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Réservation confirmée ! 🎉</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Confirmation envoyée à {email}. Vous allez être redirigé vers vos réservations.
        </p>
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
              <span className="text-sm text-zinc-500">/ séance</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5" /> {service.duration} min • Annulation gratuite 24h
            </div>
          </div>
          <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
            <Sparkles className="mr-1 inline h-3 w-3" /> IA • Meilleur créneau
          </div>
        </div>

        {/* Date picker */}
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4" /> Choisissez une date
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
                    {format(date, 'EEE', { locale: fr })}
                  </span>
                  <span className="mt-1 text-sm font-bold">{format(date, 'd')}</span>
                  {isToday && (
                    <span className={`mt-1 h-1 w-1 rounded-full ${isSelected ? "bg-white dark:bg-black" : "bg-violet-500"}`} />
                  )}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-center text-xs font-medium text-zinc-500">
            {format(selectedDate, "EEEE d MMMM", { locale: fr })} • {timeSlots.length} créneaux
          </p>
        </div>

        {/* Time slots */}
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4" /> Créneaux disponibles
          </h4>
          <div className="grid max-h-[160px] grid-cols-3 gap-2 overflow-y-auto pr-1">
            {timeSlots.map(time => {
              const booked = isSlotBooked(dateStr, time, service.id)
              const isSelected = selectedTime === time
              return (
                <button
                  key={time}
                  disabled={booked}
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-full border px-3 py-2 text-xs font-medium transition-all ${
                    booked
                      ? "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300 dark:border-zinc-800 dark:bg-zinc-800/30 dark:text-zinc-600"
                      : isSelected
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black shadow-md"
                      : "border-zinc-200 bg-white hover:border-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                  }`}
                >
                  {time}
                </button>
              )
            })}
          </div>
        </div>

        {/* Customer info */}
        {selectedTime && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-2">
            <h4 className="mb-3 text-sm font-semibold">Vos informations</h4>
            <div className="space-y-3">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nom complet"
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:focus:bg-zinc-900"
              />
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                type="email"
                className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:focus:bg-zinc-900"
              />
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedTime && (
          <div className="mt-6 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Service</span>
                <span className="font-medium">{service.name.slice(0, 22)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & heure</span>
                <span className="font-medium">{format(selectedDate, 'd MMM', { locale: fr })} à {selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Durée</span>
                <span className="font-medium">{service.duration} min</span>
              </div>
              <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(service.price)}</span>
              </div>
            </div>
          </div>
        )}

        <Button
          disabled={!selectedTime || !name || !email || loading}
          onClick={handleBooking}
          className="mt-6 w-full gap-2"
          size="lg"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Confirmation...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Confirmer • {formatPrice(service.price)}
            </>
          )}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1"><CreditCard className="h-3 w-3" /> Paiement sécurisé</span>
          <span>•</span>
          <span>Annulation gratuite</span>
          <span>•</span>
          <span>Support 24/7</span>
        </div>
      </div>
    </div>
  )
}
