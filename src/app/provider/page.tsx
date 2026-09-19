"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useProviderSpace, useMergedServices } from "@/lib/provider-context"
import { BadgeCheck, Star, MapPin, Briefcase, CalendarCheck, ShieldCheck, Wallet, ArrowRight, Sparkles, Check } from "lucide-react"

export default function ProviderLoginPage() {
  const router = useRouter()
  const { session, mounted, login } = useProviderSpace()
  const allServices = useMergedServices()

  useEffect(() => {
    if (mounted && session) router.replace("/provider/dashboard")
  }, [mounted, session, router])

  // Comptes prestataires dérivés du catalogue (un compte = un prestataire vérifié)
  const providers = useMemo(() => {
    const map = new Map<string, { name: string; city: string; rating: number; services: number }>()
    for (const s of allServices) {
      if (s.paused) continue
      const existing = map.get(s.provider.name)
      if (existing) existing.services += 1
      else map.set(s.provider.name, { name: s.provider.name, city: s.city, rating: s.provider.rating, services: 1 })
    }
    return Array.from(map.values()).sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
  }, [allServices])

  const handleLogin = (name: string) => {
    login(name)
    router.push("/provider/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      {/* Hero */}
      <div className="relative overflow-hidden bg-zinc-900 py-14 text-white dark:bg-zinc-800 sm:py-20">
        <div className="absolute inset-0 -z-0 opacity-20">
          <img src="/images/band-1.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
              <Briefcase className="h-3.5 w-3.5" /> Espace Prestataires
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Votre activité de prestataire,{" "}
              <span className="bg-gradient-to-r from-amber-300 to-red-300 bg-clip-text text-transparent">
                gérée en un coup d&apos;œil
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              Recevez des réservations de cérémonies 7j/7, confirmez les demandes en un clic, encaissez vos
              acomptes en Mobile Money et pilotez vos prestations — salle de réception, traiteur, sono, photo,
              déco, beauté, transport…
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
              {[
                {
                  icon: CalendarCheck,
                  title: "Des réservations en continu",
                  desc: "Votre vitrine visible par des milliers d'organisateurs de mariages, dotations, doto et funérailles.",
                },
                {
                  icon: Wallet,
                  title: "Acomptes garantis",
                  desc: "50% d'acompte encaissé via M-Pesa, Orange Money ou Airtel Money avant le jour J.",
                },
                {
                  icon: ShieldCheck,
                  title: "Clients sérieux",
                  desc: "Nom et téléphone obligatoires, annulation gratuite jusqu'à 72h avant la prestation.",
                },
              ].map((benefit) => (
                <div key={benefit.title} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500">
                    <benefit.icon className="h-4 w-4" />
                  </div>
                  <div className="mt-3 text-sm font-semibold">{benefit.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-white/60">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Choix du compte */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            🔐 Connexion
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Choisissez votre compte prestataire</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-zinc-500">
            Démo sans backend : sélectionnez un compte pour explorer le tableau de bord, la gestion des
            réservations et des prestations. Les données restent sur votre appareil.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {providers.map((provider) => (
            <button
              key={provider.name}
              onClick={() => handleLogin(provider.name)}
              disabled={!!session}
              className="group flex items-center gap-3 rounded-[20px] border border-zinc-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-amber-500/50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-base font-bold text-white">
                {provider.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-bold">{provider.name}</span>
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" /> {provider.city}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {provider.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-medium text-zinc-400">
                  {provider.services} prestation{provider.services > 1 ? "s" : ""} en ligne
                </div>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 transition-all group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-800 dark:group-hover:bg-white dark:group-hover:text-black">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>

        {/* Comment ça marche */}
        <div className="mt-14 rounded-[32px] bg-zinc-900 p-8 text-white dark:bg-white dark:text-black sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium dark:bg-black/10">
              <Sparkles className="h-3.5 w-3.5" />Votre routine sur Smart Booking
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">Simple comme un coup de fil</h3>
          </div>
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Recevez la demande",
                desc: "Le client réserve depuis votre vitrine. Réservation instantanée ou demande à confirmer — vous décidez.",
              },
              {
                step: "02",
                title: "Confirmez en un clic",
                desc: "Acompte de 50% sécurisé en Mobile Money, coordonnées du client débloquées, créneau bloqué dans votre agenda.",
              },
              {
                step: "03",
                title: "Prestez & encaissez",
                desc: "Solde réglé sur place le jour J. Note client, chiffre d'affaires et réputation augmentent.",
              },
            ].map((item) => (
              <div key={item.step}>
                <div className="text-4xl font-bold opacity-10">{item.step}</div>
                <h4 className="mt-2 font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-white/60 dark:text-black/60">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/60 dark:text-black/60">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Inscription gratuite
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Commission transparente : 10% par réservation
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Retrait Mobile Money sous 24h
            </span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          Vous n&apos;êtes pas encore prestataire ?{" "}
          <span className="font-semibold text-amber-600 dark:text-amber-400">
            Contactez l&apos;équipe Smart Booking RDC 🇨🇩
          </span>
        </p>
      </div>
    </div>
  )
}
