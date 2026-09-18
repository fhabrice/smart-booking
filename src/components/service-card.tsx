"use client"

import Link from "next/link"
import { Star, Clock, MapPin, Heart, Check, Users } from "lucide-react"
import { Service } from "@/lib/types"
import { formatPrice, formatPriceFC, cn } from "@/lib/utils"
import { categoryName } from "@/lib/data"
import { useState } from "react"

export function ServiceCard({ service, featured }: { service: Service; featured?: boolean }) {
  const [liked, setLiked] = useState(false)

  return (
    <Link
      href={`/services/${service.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[24px] border border-zinc-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-black/20",
        featured ? "md:flex-row" : ""
      )}
    >
      <div className={cn("relative overflow-hidden", featured ? "aspect-[4/3] w-full md:aspect-auto md:w-[52%]" : "aspect-[4/3] w-full")}>
        <img
          src={service.image}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {service.popular && (
            <div className="rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              🔥 Populaire
            </div>
          )}
          {service.instant && (
            <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur dark:bg-zinc-800/90">
              ⚡ Instantané
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault()
            setLiked(!liked)
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition-all hover:bg-white dark:bg-zinc-800/90 dark:hover:bg-zinc-800"
          aria-label="Favori"
        >
          <Heart className={cn("h-4 w-4 transition-colors", liked ? "fill-red-500 text-red-500" : "text-zinc-600")} />
        </button>

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur dark:bg-zinc-800/90">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{service.rating}</span>
            <span className="text-zinc-500">({service.reviews})</span>
          </div>
          <div className="hidden items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur md:flex">
            <MapPin className="h-3 w-3" /> {service.city}
          </div>
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-4", featured ? "md:w-[48%] md:p-6" : "")}>
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            {categoryName(service.category)}
          </span>
          {service.provider.verified && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3 rounded-full bg-emerald-500 p-0.5 text-white" /> Vérifié
            </span>
          )}
        </div>

        <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight tracking-tight md:text-base">{service.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{service.description}</p>

        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <img src={service.provider.avatar} alt={service.provider.name} className="h-5 w-5 rounded-full object-cover" />
          <span className="font-medium text-zinc-700 dark:text-zinc-300">{service.provider.name}</span>
          <span>•</span>
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3 w-3 shrink-0" /> {service.location}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold tracking-tight">{formatPrice(service.price)}</span>
              <span className="text-xs font-medium text-zinc-500">{service.priceUnit}</span>
            </div>
            <div className="mt-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
              ≈ {formatPriceFC(service.price)}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-500">
              <Clock className="h-3 w-3" /> Confirmation instantanée
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
