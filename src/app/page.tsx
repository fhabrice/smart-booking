"use client"

import { useState, useMemo } from "react"
import { services } from "@/lib/data"
import { ServiceCard } from "@/components/service-card"
import { SearchBar } from "@/components/search-bar"
import { Sparkles, Zap, Shield, Clock, Users, TrendingUp, ArrowRight, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchQuery = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase())
      const matchCat = category === "all" || s.category === category
      return matchQuery && matchCat
    })
  }, [query, category])

  const featured = filtered.find(s => s.popular) || filtered[0]
  const rest = filtered.filter(s => s.id !== featured?.id)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50/80 via-white to-[#fcfcf9] dark:from-violet-950/20 dark:via-zinc-950 dark:to-zinc-950" />
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-200/30 to-fuchsia-200/30 blur-3xl dark:from-violet-900/20 dark:to-fuchsia-900/20" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500"></span>
              </span>
              Nouveau • IA qui trouve le meilleur créneau pour vous
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Réservez en{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">30 secondes</span>
                <div className="absolute bottom-2 left-0 right-0 h-3 bg-violet-100 dark:bg-violet-900/30 -z-0 -rotate-1" />
              </span>
              , pas en 30 minutes.
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
              La première plateforme qui comprend vos préférences. Beauté, bien-être, business, coaching — tout est instantané, vérifié, sans appel.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="h-6 w-6 rounded-full border-2 border-white dark:border-zinc-900" alt="" />
                  ))}
                </div>
                <span className="font-medium">2,847 clients heureux ce mois</span>
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
                <Shield className="h-3.5 w-3.5" /> Paiement sécurisé • Annulation gratuite
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <SearchBar onSearch={setQuery} onCategoryChange={setCategory} activeCategory={category} />
          </div>

          {/* Stats */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-4 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:gap-8 sm:p-6">
            {[
              { icon: Zap, label: "Réservation instantanée", value: "< 30s" },
              { icon: Users, label: "Prestataires vérifiés", value: "100%" },
              { icon: Clock, label: "Disponible", value: "24/7" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black sm:h-10 sm:w-10">
                  <stat.icon className="h-4 w-4" />
                </div>
                <div className="mt-2 text-lg font-bold tracking-tight sm:text-xl">{stat.value}</div>
                <div className="text-[11px] font-medium text-zinc-500 sm:text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {query ? `Résultats pour "${query}"` : category === "all" ? "Recommandé pour vous" : `Catégorie ${category}`}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {filtered.length} service{filtered.length > 1 ? 's' : ''} • Trié par IA selon vos préférences
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
            <p className="mt-1 text-sm text-zinc-500">Essayez une autre recherche ou catégorie</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setQuery(""); setCategory("all") }}>
              Réinitialiser
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {featured && (
              <div className="sm:col-span-2 lg:col-span-2">
                <ServiceCard service={featured} featured />
              </div>
            )}
            {rest.map(service => (
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
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">3 étapes, zéro friction</h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "Choisissez", desc: "L'IA vous suggère les meilleurs prestataires selon votre historique et préférences.", icon: "🔍" },
              { step: "02", title: "Réservez", desc: "Calendrier temps réel, créneaux instantanés. Pas d'appel, pas d'attente.", icon: "⚡" },
              { step: "03", title: "Profitez", desc: "Confirmation immédiate, rappel auto, paiement sécurisé. Vous n'avez qu'à venir.", icon: "✨" },
            ].map(item => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold opacity-10">{item.step}</div>
                <div className="mt-2 text-2xl">{item.icon}</div>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60 dark:text-black/60">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-6 rounded-full bg-white/10 px-6 py-3 text-xs dark:bg-black/10">
              <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> 4.9/5 (1,203 avis)</span>
              <span className="h-4 w-px bg-white/20 dark:bg-black/20" />
              <span>⚡ Réservation moyenne: 27 secondes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
