"use client"

import { useParams } from "next/navigation"
import { services } from "@/lib/data"
import { formatPrice } from "@/lib/utils"
import { Star, MapPin, Clock, Shield, Check, ArrowLeft, Heart, Share2, Award, Sparkles } from "lucide-react"
import Link from "next/link"
import { BookingWidget } from "@/components/booking-widget"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function ServicePage() {
  const params = useParams()
  const id = params.id as string
  const service = services.find(s => s.id === id)
  const [liked, setLiked] = useState(false)

  if (!service) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Service introuvable</h1>
        <Link href="/" className="mt-4 inline-block text-sm underline">Retour à l&apos;accueil</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
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
                    <div className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-black">🔥 Populaire</div>
                  )}
                  {service.instant && (
                    <div className="rounded-full bg-white/90 backdrop-blur px-3 py-1 text-xs font-semibold shadow-sm">⚡ Instantané</div>
                  )}
                </div>
                <div className="absolute right-4 top-4 flex gap-2">
                  <button onClick={() => setLiked(!liked)} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm">
                    <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{service.category}</span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><Check className="h-3 w-3 rounded-full bg-emerald-500 p-0.5 text-white" /> Vérifié • {service.provider.experience}</span>
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

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800">
                  <img src={service.provider.avatar} className="h-6 w-6 rounded-full object-cover" alt="" />
                  <span className="font-medium">{service.provider.name}</span>
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500"><MapPin className="h-4 w-4" /> {service.location}</div>
                <div className="flex items-center gap-1.5 text-zinc-500"><Clock className="h-4 w-4" /> {service.duration} min</div>
                <div className="flex items-center gap-1.5 text-zinc-500"><Shield className="h-4 w-4" /> Annulation gratuite 24h</div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold">À propos</h3>
                <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{service.longDescription}</p>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold">Inclus</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {service.features.map(feat => (
                    <div key={feat} className="flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-3 w-3" /></div>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4 dark:from-violet-950/20 dark:to-fuchsia-950/20 border border-violet-100 dark:border-violet-900/50">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white"><Sparkles className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-semibold">Recommandation IA</div>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Ce prestataire a un taux de satisfaction de 98% et répond en moyenne en 3 minutes. Créneau le plus demandé : 14h-16h. Réservez maintenant pour garantir votre place.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews preview */}
            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <h3 className="font-semibold">Avis clients • {service.reviews}</h3>
              <div className="mt-4 grid gap-4">
                {[
                  { name: "Julie M.", text: "Incroyable expérience, je recommande les yeux fermés. Professionnel au top et résultat parfait.", rating: 5 },
                  { name: "Thomas R.", text: "Réservation en 20 secondes, service impeccable. La plateforme change tout.", rating: 5 },
                  { name: "Sarah L.", text: "3e fois que je réserve ici, toujours aussi bien. L'IA trouve vraiment les meilleurs créneaux.", rating: 5 },
                ].map((review, i) => (
                  <div key={i} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{review.name}</span>
                      <div className="flex">{Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Booking widget */}
          <div>
            <BookingWidget service={service} />
            
            <div className="mt-4 rounded-[20px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <img src={service.provider.avatar} className="h-10 w-10 rounded-full" alt="" />
                <div>
                  <div className="text-sm font-semibold">{service.provider.name}</div>
                  <div className="text-xs text-zinc-500">Répond en ~3 min • {service.provider.experience}</div>
                </div>
                <Button size="sm" variant="outline" className="ml-auto">Message</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
