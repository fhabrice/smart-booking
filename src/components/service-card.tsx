"use client"

import Link from "next/link"
import { Star, MapPin, Zap, Heart, Check, Shield, Users } from "lucide-react"
import { Service } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useState } from "react"

export function ServiceCard({ service, featured }: { service: Service; featured?: boolean }) {
  const [liked, setLiked] = useState(false)

  const formatPrice = (price: number, unit: string) => {
    if (unit.includes('/ personne') || unit.includes('/ chaise') || unit.includes('/ agent')) {
      return `$${price}`
    }
    return `$${price}`
  }

  return (
    <Link
      href={`/services/${service.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[24px] border bg-white transition-all hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-1 dark:bg-zinc-900",
        service.provider.adminApproved ? "border-zinc-200 dark:border-zinc-800" : "border-amber-200 bg-amber-50/30 dark:border-amber-900 dark:bg-amber-950/10",
        featured ? "md:col-span-2 md:flex-row" : ""
      )}
    >
      <div className={cn("relative overflow-hidden", featured ? "md:w-[55%]" : "aspect-[4/3] w-full")}>
        <img
          src={service.image}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
        
        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 max-w-[80%]">
          {service.popular && (
            <div className="flex items-center gap-1 rounded-full bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-black">
              <span>🔥</span> Populaire
            </div>
          )}
          {service.instant && service.provider.adminApproved && (
            <div className="flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-zinc-900 shadow-sm">
              <Zap className="h-3 w-3 fill-amber-400 text-amber-400" /> Instant
            </div>
          )}
          {!service.provider.adminApproved && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              ⏳ En attente admin
            </div>
          )}
          {service.provider.adminApproved && (
            <div className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
              <Shield className="h-3 w-3" /> Admin approuvé
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            setLiked(!liked)
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm transition-all hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800"
        >
          <Heart className={cn("h-4 w-4 transition-colors", liked ? "fill-red-500 text-red-500" : "text-zinc-600")} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-xs font-medium shadow-sm dark:bg-zinc-800/90">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{service.rating}</span>
            <span className="text-zinc-500">({service.reviews})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full bg-black/70 backdrop-blur px-2.5 py-1 text-xs font-medium text-white md:flex">
              <MapPin className="h-3 w-3" /> {service.city}
            </div>
            <div className="flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1 text-xs font-bold text-white">
              {service.province === 'nord-kivu' ? '📍 Goma' : service.province === 'sud-kivu' ? '📍 Bukavu' : service.province === 'kinshasa' ? '📍 Kin' : service.province === 'haut-katanga' ? '📍 L\'shi' : `📍 ${service.city}`}
            </div>
          </div>
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-4", featured ? "md:w-[45%] md:p-6" : "")}>
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
            {service.category === 'salles' ? '🏛️ Salle' : service.category === 'traiteur' ? '🍛 Traiteur' : service.category === 'decoration' ? '🎨 Déco' : service.category === 'sonorisation' ? '🔊 Sono' : service.category === 'photo' ? '📸 Photo' : service.category === 'animation' ? '🎤 Animation' : '🪑 Matériel'}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            {service.city} • {service.province.replace('-', ' ')}
          </span>
          {service.provider.verified && service.provider.adminApproved && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3 rounded-full bg-emerald-500 p-0.5 text-white" /> Vérifié
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight tracking-tight md:text-base">
          {service.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {service.description}
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {service.eventTypes.slice(0, 3).map(et => (
            <span key={et} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {et === 'mariage' ? '💍 Mariage' : et === 'dot' ? '👑 Dot' : et === 'conference' ? '🎤 Conférence' : et === 'reunion' ? '💼 Réunion' : et === 'anniversaire' ? '🎂 Anniv' : et}
            </span>
          ))}
          {service.eventTypes.length > 3 && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">+{service.eventTypes.length - 3}</span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <img src={service.provider.avatar} alt={service.provider.name} className="h-5 w-5 rounded-full object-cover" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{service.provider.name}</span>
          <span className="hidden sm:inline">• {service.provider.experience.split('•')[0]}</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight">{formatPrice(service.price, service.priceUnit)}</span>
              <span className="text-xs text-zinc-500">{service.priceUnit}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
              <Users className="h-3 w-3" /> {service.capacity || 'Sur devis'} • {service.provider.adminApproved ? 'Réservation auto' : 'Validation admin requise'}
            </div>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white transition-colors group-hover:bg-black dark:bg-white dark:text-black">
            <span className="text-lg leading-none">→</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
