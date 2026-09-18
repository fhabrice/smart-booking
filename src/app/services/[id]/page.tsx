"use client"

import { useParams, useSearchParams } from "next/navigation"
import { services, categoryName } from "@/lib/data"
import { formatPrice, formatPriceFC } from "@/lib/utils"
import { Star, MapPin, Clock, Shield, Check, ArrowLeft, Heart, Share2, Award, Sparkles, Users } from "lucide-react"
import Link from "next/link"
import { BookingWidget } from "@/components/booking-widget"
import { Suspense, useState } from "react"

const reviews = [
  {
    name: "Chantal K.",
    text: "Prestation impeccable pour notre mariage à Gombe. Invités bluffés, et tout était prêt à l'heure. Je recommande à 100%.",
    rating: 5,
    ceremony: "Mariage · Kinshasa",
  },
  {
    name: "Jean-Bosco M.",
    text: "Réservé en 30 secondes, payé l'acompte en M-Pesa sans stress. Le jour J, équipe sérieuse et souriante. Bravo !",
    rating: 5,
    ceremony: "Dotation · Lubumbashi",
  },
  {
    name: "Esther & Patrick",
    text: "3e prestation réservée via Smart Booking pour la doto de notre fille. Toujours aussi fiable, rapport qualité-prix au top.",
    rating: 5,
    ceremony: "Baptême · Goma",
  },
]

function ServicePageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("event") ?? undefined
  const id = params.id as string
  const service = services.find((s) => s.id === id)
  const [liked, setLiked] = useState(false)

  if (!service) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Service introuvable</h1>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* Left */}
          <div>
            {/* Gallery */}
            <div className="overflow-hidden rounded-[24px] bg-white dark:bg-zinc-900">
              <div className="relative aspect-[16/10]">
                <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 flex gap-2">
                  {service.popular && (
                    <div className="rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-3 py-1 text-xs font-semibold text-white">
                      🔥 Populaire
                    </div>
                  )}
                  {service.instant && (
                    <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur">
                      ⚡ Instantané
                    </div>
                  )}
                </div>
                <div className="absolute right-4 top-4 flex gap-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur"
                    aria-label="Favori"
                  >
                    <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur" aria-label="Partager">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      {categoryName(service.category)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3 rounded-full bg-emerald-500 p-0.5 text-white" /> Vérifié •{" "}
                      {service.provider.experience}
                    </span>
                  </div>
                  <h1 className="mt-3 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">{service.name}</h1>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">{service.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 dark:border-zinc-800">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold">{service.rating}</span>
                    <span className="text-xs text-zinc-500">({service.reviews} avis)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800">
                  <img src={service.provider.avatar} className="h-6 w-6 rounded-full object-cover" alt="" />
                  <span className="font-medium">{service.provider.name}</span>
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <MapPin className="h-4 w-4" /> {service.city} · {service.location}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Clock className="h-4 w-4" /> {Math.round(service.duration / 60)}h sur place
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Shield className="h-4 w-4" /> Annulation gratuite 72h
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold">À propos</h3>
                <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{service.longDescription}</p>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold">Inclus</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {service.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-red-50 p-4 dark:border-amber-900/50 dark:from-amber-950/20 dark:to-red-950/20">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Conseil Smart Booking</div>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Pour une cérémonie sereine : réservez cette prestation au moins 3 semaines à l'avance, surtout pour les
                      samedi. Acompte de 50% en Mobile Money, solde réglé sur place le jour J. Créneau le plus demandé :
                      10h-16h.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <h3 className="font-semibold">Avis clients • {service.reviews}</h3>
              <div className="mt-4 grid gap-4">
                {reviews.map((review, i) => (
                  <div key={i} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{review.name}</span>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{review.text}</p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                      <Users className="h-3 w-3" /> {review.ceremony}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Booking widget */}
          <div>
            <BookingWidget service={service} defaultEventId={eventId} />

            <div className="mt-4 rounded-[20px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <img src={service.provider.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
                <div>
                  <div className="text-sm font-semibold">{service.provider.name}</div>
                  <div className="text-xs text-zinc-500">Répond en ~5 min • {service.provider.experience}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-bold">{formatPrice(service.price)}</div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">≈ {formatPriceFC(service.price)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ServicePage() {
  return (
    <Suspense>
      <ServicePageContent />
    </Suspense>
  )
}
