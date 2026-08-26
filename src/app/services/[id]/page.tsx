"use client"

import { useParams } from "next/navigation"
import { services, provinces } from "@/lib/data"
import { Star, MapPin, Clock, Shield, Check, ArrowLeft, Heart, Share2, Award, Sparkles, Phone, Users, PartyPopper, AlertTriangle } from "lucide-react"
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

  const province = provinces.find(p => p.id === service.province)

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
          <ArrowLeft className="h-4 w-4" /> Retour • {province?.name}
        </Link>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* Left */}
          <div>
            {/* Gallery */}
            <div className="overflow-hidden rounded-[24px] bg-white dark:bg-zinc-900">
              <div className="relative aspect-[16/10]">
                <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2 max-w-[70%]">
                  {service.popular && (
                    <div className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-black">🔥 Populaire en {service.city}</div>
                  )}
                  {service.provider.adminApproved ? (
                    <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white flex items-center gap-1"><Shield className="h-3 w-3" /> Admin approuvé • Vérifié</div>
                  ) : (
                    <div className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> En attente validation admin</div>
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
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <div className="rounded-full bg-black/70 backdrop-blur px-3 py-1 text-xs font-medium text-white">
                    📍 {service.city} • {province?.name} • {service.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
                      {service.category} • {service.city}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      🇨🇩 {province?.name} • {province?.capital}
                    </span>
                    {service.provider.adminApproved && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><Check className="h-3 w-3 rounded-full bg-emerald-500 p-0.5 text-white" /> Vérifié • {service.provider.experience}</span>
                    )}
                  </div>
                  <h1 className="mt-3 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">{service.name}</h1>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">{service.description}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {service.eventTypes.map(et => (
                      <span key={et} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium dark:bg-zinc-800">
                        {et === 'mariage' ? '💍 Mariage' : et === 'dot' ? '👑 Dot' : et === 'conference' ? '🎤 Conférence' : et === 'reunion' ? '💼 Réunion' : et}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-zinc-200 px-3 py-1.5 dark:border-zinc-800">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold">{service.rating}</span>
                    <span className="text-xs text-zinc-500">({service.reviews} avis RDC)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800">
                  <img src={service.provider.avatar} className="h-6 w-6 rounded-full object-cover" alt="" />
                  <span className="font-medium">{service.provider.name}</span>
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500"><MapPin className="h-4 w-4" /> {service.location}</div>
                <div className="flex items-center gap-1.5 text-zinc-500"><Users className="h-4 w-4" /> {service.capacity}</div>
                <div className="flex items-center gap-1.5 text-zinc-500"><Phone className="h-4 w-4" /> {service.provider.phone}</div>
              </div>

              {!service.provider.adminApproved && (
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-amber-900 dark:text-amber-200">Prestataire en cours de validation</div>
                      <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                        Ce prestataire a soumis ses documents. Notre admin à Goma vérifie physiquement son activité, ses photos et ses références. Validation sous 24h. Vous pouvez le contacter directement au {service.provider.phone} en attendant.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h3 className="font-semibold flex items-center gap-2"><PartyPopper className="h-4 w-4" /> À propos du service</h3>
                <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{service.longDescription}</p>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold">Inclus dans le prix</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {service.features.map(feat => (
                    <div key={feat} className="flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-3 w-3" /></div>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50 to-violet-50 p-4 dark:from-blue-950/20 dark:to-violet-950/20 border border-blue-100 dark:border-blue-900/50">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white"><Sparkles className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-semibold">🇨🇩 Recommandation RDC</div>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Très demandé à {service.city} pour les dots et mariages. Taux de satisfaction 98% sur {service.reviews} événements. Répond en moyenne en 12 minutes. Admin a validé ses 3 dernières prestations. Créneau le plus demandé : samedi 14h.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                <div>
                  <div className="text-xs text-zinc-500">📍 Province</div>
                  <div className="font-semibold">{province?.name} • {service.city}</div>
                  <div className="text-xs text-zinc-500">{province?.capital} • {province?.count} prestataires</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">💳 Paiement</div>
                  <div className="font-semibold">Mobile Money + Cash</div>
                  <div className="text-xs text-zinc-500">M-Pesa, Orange, Airtel • Acompte 30%</div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <h3 className="font-semibold flex items-center gap-2">⭐ Avis clients RDC • {service.reviews}</h3>
              <div className="mt-4 grid gap-4">
                {[
                  { name: "Aline K. - Goma", text: "Mon mariage à l'hôtel Serena, tout parfait! Traiteur à l'heure, déco magnifique. Merci Smart Booking Event!", rating: 5, city: "Goma" },
                  { name: "Patrick M. - Kinshasa", text: "Réservation en 1 minute pour ma conférence. Salle ShowBuzz au top, sono impeccable. Admin très réactif.", rating: 5, city: "Kinshasa" },
                  { name: "Grace B. - Bukavu", text: "Dot traditionnelle réussie grâce à Jardin d'Eden. Vue lac magnifique, service traiteur kivucien délicieux.", rating: 5, city: "Bukavu" },
                ].map((review, i) => (
                  <div key={i} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{review.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] rounded-full bg-white px-2 py-0.5 border dark:bg-zinc-900">{review.city}</span>
                        <div className="flex">{Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
                      </div>
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
                  <div className="text-sm font-semibold flex items-center gap-1">{service.provider.name} {service.provider.adminApproved && <Check className="h-3 w-3 bg-emerald-500 text-white rounded-full p-0.5" />}</div>
                  <div className="text-xs text-zinc-500">Répond en ~12 min • {service.provider.experience}</div>
                  <div className="text-xs text-zinc-500">{service.provider.phone} • {service.provider.servicesCount} services</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <a href={`tel:${service.provider.phone}`} className="flex items-center justify-center gap-1 rounded-full bg-zinc-900 text-white py-2 text-xs font-medium dark:bg-white dark:text-black">
                  <Phone className="h-3 w-3" /> Appeler
                </a>
                <a href={`https://wa.me/${service.provider.phone.replace(/\s/g, '')}`} target="_blank" className="flex items-center justify-center gap-1 rounded-full border py-2 text-xs font-medium">
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="mt-4 rounded-[20px] bg-zinc-900 p-4 text-white dark:bg-white dark:text-black">
              <div className="text-sm font-semibold">🇨🇩 Besoin d'aide en RDC ?</div>
              <div className="mt-1 text-xs text-white/60 dark:text-black/60">Support Goma • Français, Swahili, Lingala • 24/7</div>
              <a href="tel:+243976459970" className="mt-3 flex items-center justify-center gap-2 rounded-full bg-white py-2 text-sm font-bold text-black dark:bg-black dark:text-white">
                <Phone className="h-4 w-4" /> +243 976 459 970
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
