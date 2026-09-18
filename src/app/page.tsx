"use client"

import { useState, useMemo } from "react"
import { services, eventTypes, cities } from "@/lib/data"
import { ServiceCard } from "@/components/service-card"
import { SearchBar } from "@/components/search-bar"
import { Sparkles, Zap, Shield, Clock, Users, TrendingUp, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [city, setCity] = useState("all")

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const q = query.toLowerCase()
      const matchQuery =
        !query ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.provider.name.toLowerCase().includes(q)
      const matchCat = category === "all" || s.category === category
      const matchCity = city === "all" || s.city === city
      return matchQuery && matchCat && matchCity
    })
  }, [query, category, city])

  const featured = filtered.find((s) => s.popular) || filtered[0]
  const rest = filtered.filter((s) => s.id !== featured?.id)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src="/images/hero.jpg" alt="Célébration de mariage en RDC" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#fcfcf9] dark:from-black/80 dark:via-black/70 dark:to-zinc-950" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </span>
              N°1 de la réservation cérémonie en RDC 🇨🇩
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Tous les services de votre{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 bg-clip-text text-transparent">
                  cérémonie
                </span>
                <div className="absolute bottom-2 left-0 right-0 -z-0 h-3 -rotate-1 bg-amber-500/30" />
              </span>
              , en 30 secondes.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              Mariage, dotation, baptême, anniversaire, funérailles… Salles, traiteurs, décoration, sono & DJ,
              photo, beauté, transport, animation — réservés au même endroit, payés en <strong className="text-white">Mobile Money</strong>.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-white backdrop-blur">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <img
                      key={i}
                      src={`/images/avatar-${i}.jpg`}
                      className="h-6 w-6 rounded-full border-2 border-white/60 object-cover"
                      alt=""
                    />
                  ))}
                </div>
                <span className="font-medium">2 847 cérémonies organisées</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/20 px-3 py-1.5 text-emerald-100 backdrop-blur">
                <Shield className="h-3.5 w-3.5" /> M-Pesa · Orange Money · Airtel Money
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <SearchBar
              onSearch={setQuery}
              onCategoryChange={setCategory}
              onCityChange={setCity}
              activeCategory={category}
              activeCity={city}
            />
          </div>

          {/* Stats */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 rounded-[20px] border border-white/10 bg-white/95 p-4 shadow-2xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 sm:gap-8 sm:p-6">
            {[
              { icon: Zap, label: "Réservation instantanée", value: "< 30s" },
              { icon: Users, label: "Prestataires vérifiés", value: "100%" },
              { icon: Clock, label: "Villes couvertes", value: `${cities.length}` },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-white sm:h-10 sm:w-10">
                  <stat.icon className="h-4 w-4" />
                </div>
                <div className="mt-2 text-lg font-bold tracking-tight sm:text-xl">{stat.value}</div>
                <div className="text-[11px] font-medium text-zinc-500 sm:text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Types de cérémonie */}
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            🎉 Organisez sans stress
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Quelle cérémonie préparez-vous ?</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Créez votre événement et recevez la liste complète des prestataires à réserver
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {eventTypes.map((type) => (
            <Link
              key={type.id}
              href={`/events/new?type=${type.id}`}
              className="group rounded-3xl border border-zinc-200 bg-white p-5 text-center transition-all hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-500/50"
            >
              <div className="text-4xl transition-transform group-hover:scale-110">{type.icon}</div>
              <div className="mt-3 text-sm font-semibold">{type.label}</div>
              <div className="mt-1 text-[11px] leading-snug text-zinc-500">{type.desc}</div>
              <div className="mt-3 text-[11px] font-semibold text-amber-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-amber-400">
                Commencer →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {query
                ? `Résultats pour « ${query} »`
                : city !== "all"
                  ? `Prestataires à ${city}`
                  : "Tous les services de cérémonie"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {filtered.length} service{filtered.length > 1 ? "s" : ""} • Prix en USD, équivalent FC affiché
            </p>
          </div>
          <Link href="/bookings" className="hidden items-center gap-2 text-sm font-medium hover:underline sm:flex">
            Voir mes réservations <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-[24px] border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Sparkles className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="mt-4 font-semibold">Aucun résultat</h3>
            <p className="mt-1 text-sm text-zinc-500">Essayez une autre recherche, ville ou catégorie</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setQuery("")
                setCategory("all")
                setCity("all")
              }}
            >
              Réinitialiser
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {featured && (
              <div className="sm:col-span-2">
                <ServiceCard service={featured} featured />
              </div>
            )}
            {rest.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* How it works */}
        <div className="mt-20 rounded-[32px] bg-zinc-900 p-8 text-white dark:bg-white dark:text-black sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium dark:bg-black/10">
              <Sparkles className="h-3.5 w-3.5" /> Comment ça marche
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">3 étapes, zéro stress</h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Créez votre cérémonie",
                desc: "Mariage, dotation, baptême… Indiquez la date, la ville et le nombre d'invités. On génère votre checklist complète.",
                icon: "🎉",
              },
              {
                step: "02",
                title: "Réservez chaque prestation",
                desc: "Salle, traiteur, déco, sono, photo, beauté, transport — tout au même endroit, acompte 50% en Mobile Money.",
                icon: "⚡",
              },
              {
                step: "03",
                title: "Suivez tout au même endroit",
                desc: "Budget en temps réel, déroulé du jour J, rappels automatiques. Vous n'avez qu'à danser.",
                icon: "✨",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold opacity-10">{item.step}</div>
                <div className="mt-2 text-2xl">{item.icon}</div>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60 dark:text-black/60">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/events/new"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-6 py-3 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-amber-500/25"
            >
              🎊 Organiser ma cérémonie maintenant
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full bg-white/10 px-6 py-3 text-xs dark:bg-black/10">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> 4,9/5 (1 203 avis)
              </span>
              <span className="h-4 w-px bg-white/20 dark:bg-black/20" />
              <span>⚡ Réservation moyenne : 27 secondes</span>
              <span className="h-4 w-px bg-white/20 dark:bg-black/20" />
              <span>💰 Taux affiché : 1 USD ≈ 2 850 FC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
