"use client"

import { useState } from "react"
import { Service } from "@/lib/types"
import { generateTimeSlots } from "@/lib/utils"
import { Button } from "./ui/button"
import { Calendar, Clock, Check, Sparkles, Shield, Phone, Users, PartyPopper } from "lucide-react"
import { format, addDays, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import { useBookings } from "@/lib/booking-context"
import { useRouter } from "next/navigation"

export function BookingWidget({ service }: { service: Service }) {
  const router = useRouter()
  const { addBooking, isSlotBooked } = useBookings()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [eventType, setEventType] = useState<string>(service.eventTypes[0] || "mariage")
  const [guests, setGuests] = useState<number>(100)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))
  const timeSlots = generateTimeSlots()
  const dateStr = format(selectedDate, 'yyyy-MM-dd')

  const totalPrice = service.priceUnit.includes('/ personne') || service.priceUnit.includes('/ chaise') || service.priceUnit.includes('/ agent')
    ? service.price * guests
    : service.price

  const handleBooking = async () => {
    if (!selectedTime || !name || !phone) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    addBooking({
      serviceId: service.id,
      serviceName: service.name,
      serviceImage: service.image,
      category: service.category,
      province: service.province,
      city: service.city,
      date: dateStr,
      time: selectedTime,
      eventType,
      guests,
      duration: 480,
      price: totalPrice,
      providerName: service.provider.name,
      providerPhone: service.provider.phone,
      location: service.location,
      customerName: name,
      customerPhone: phone,
      notes
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
          Confirmation envoyée. Le prestataire <b>{service.provider.name}</b> va vous contacter au {phone} sous 30 min. Admin a été notifié.
        </p>
        <div className="mt-4 rounded-2xl bg-white p-3 text-xs dark:bg-zinc-900">
          📞 Support RDC: +243 976 459 970 • Validation admin automatique
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-24 rounded-[24px] border border-zinc-200 bg-white shadow-xl shadow-zinc-200/30 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold tracking-tight">${service.price}</span>
              <span className="text-sm text-zinc-500">{service.priceUnit}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
              <Clock className="h-3.5 w-3.5" /> {service.capacity} • Annulation gratuite 48h
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
              <Sparkles className="mr-1 inline h-3 w-3" /> Réservation auto
            </div>
            {service.provider.adminApproved ? (
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 text-center">
                ✅ Admin approuvé
              </div>
            ) : (
              <div className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 text-center">
                ⏳ Validation admin
              </div>
            )}
          </div>
        </div>

        {/* Event type */}
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <PartyPopper className="h-4 w-4" /> Type d'événement
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {service.eventTypes.map(type => (
              <button
                key={type}
                onClick={() => setEventType(type)}
                className={`rounded-full border px-3 py-2 text-xs font-medium capitalize transition-all ${
                  eventType === type
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-zinc-200 bg-zinc-50 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800"
                }`}
              >
                {type === 'mariage' ? '💍 Mariage' : type === 'dot' ? '👑 Dot' : type === 'conference' ? '🎤 Conférence' : type === 'reunion' ? '💼 Réunion' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Guests */}
        {(service.priceUnit.includes('/ personne') || service.category === 'salles') && (
          <div className="mt-5">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4" /> Nombre d'invités
            </h4>
            <div className="flex items-center gap-3 rounded-full border border-zinc-200 p-1 dark:border-zinc-700">
              <button onClick={() => setGuests(Math.max(10, guests - 10))} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">-</button>
              <div className="flex-1 text-center text-sm font-bold">{guests} invités</div>
              <button onClick={() => setGuests(guests + 10)} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black">+</button>
            </div>
            <div className="mt-2 text-xs text-zinc-500 text-center">
              Capacité salle: {service.capacity}
            </div>
          </div>
        )}

        {/* Date picker */}
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Calendar className="h-4 w-4" /> Date de l'événement
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
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        {/* Time slots */}
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Clock className="h-4 w-4" /> Heure de début
          </h4>
          <div className="grid max-h-[120px] grid-cols-3 gap-2 overflow-y-auto pr-1">
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
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm">🇨🇩</span>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+243 976 459 970"
                  type="tel"
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm font-medium placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:focus:bg-zinc-900"
                />
              </div>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Détails: thème, budget, demandes spéciales..."
                rows={2}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:focus:bg-zinc-900"
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
                <span className="font-medium">{service.name.slice(0, 20)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Événement</span>
                <span className="font-medium capitalize">{eventType} • {guests} invités</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Date & heure</span>
                <span className="font-medium">{format(selectedDate, 'd MMM', { locale: fr })} à {selectedTime}</span>
              </div>
              <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex justify-between font-bold text-base">
                <span>Total estimé</span>
                <span>${totalPrice}</span>
              </div>
              <div className="text-[11px] text-zinc-500">
                * Prix final confirmé par prestataire + validation admin. Acompte 30% via Mobile Money.
              </div>
            </div>
          </div>
        )}

        <Button
          disabled={!selectedTime || !name || !phone || loading || !service.provider.adminApproved}
          onClick={handleBooking}
          className="mt-6 w-full gap-2"
          size="lg"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Réservation...
            </>
          ) : !service.provider.adminApproved ? (
            <>
              ⏳ En attente validation admin
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Réserver • ${totalPrice}
            </>
          )}
        </Button>

        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-zinc-500 text-center">
          <Phone className="h-3 w-3" /> Support RDC: +243 976 459 970 • Admin valide sous 2h
        </div>

        <div className="mt-4 rounded-2xl bg-blue-50 p-3 dark:bg-blue-950/20">
          <div className="text-xs font-semibold text-blue-900 dark:text-blue-200">💡 Comment ça marche ?</div>
          <div className="mt-1 text-[11px] leading-relaxed text-blue-700 dark:text-blue-300">
            1. Vous réservez → 2. Prestataire vous appelle (30 min) → 3. Admin valide → 4. Vous payez acompte Mobile Money → 5. Service garanti le jour J.
          </div>
        </div>
      </div>
    </div>
  )
}
