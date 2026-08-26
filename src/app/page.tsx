"use client"

import { useState, useMemo } from "react"
import { services, provinces, eventTypes } from "@/lib/data"
import { ServiceCard } from "@/components/service-card"
import { SearchBar } from "@/components/search-bar"
import { Sparkles, Zap, Shield, Clock, Users, TrendingUp, ArrowRight, Star, Phone, MapPin, Check, Award, PartyPopper } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [province, setProvince] = useState("all")

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchQuery = !query || s.name.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase()) || s.city.toLowerCase().includes(query.toLowerCase())
      const matchCat = category === "all" || s.category === category
      const matchProv = province === "all" || s.province === province
      return matchQuery && matchCat && matchProv
    })
  }, [query, category, province])

  const featured = filtered.find(s => s.popular && s.provider.adminApproved) || filtered[0]
  const rest = filtered.filter(s => s.id !== featured?.id)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white to-[#fcfcf9] dark:from-blue-950/20 dark:via-zinc-950 dark:to-zinc-950" />
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-200/30 to-violet-200/30 blur-3xl dark:from-blue-900/20 dark:to-violet-900/20" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 sm:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              🇨🇩 Première plateforme événementielle RDC • 8 provinces • Validation admin
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] dark:bg-zinc-800"><Shield className="h-3 w-3" /> Admin approuvé</span>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Votre mariage, dot, conférence{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">réussi en RDC</span>
                <div className="absolute bottom-2 left-0 right-0 h-3 bg-blue-100 dark:bg-blue-900/30 -z-0 -rotate-1" />
              </span>
              .
            </h1>
            
            <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">
              Salles, traiteurs, décoration, sono, photo, animateurs... Tous les prestataires de cérémonie du Congo, <b className="text-zinc-900 dark:text-white">vérifiés et approuvés par notre admin</b>. De Goma à Kinshasa, de Lubumbashi à Bukavu — réservez en 30 secondes.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
              {eventTypes.slice(0, 5).map(et => (
                <span key={et.id} className="rounded-full bg-white px-3 py-1.5 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                  {et.icon} {et.name}
                </span>
              ))}
              <span className="rounded-full bg-zinc-900 text-white px-3 py-1.5 dark:bg-white dark:text-black">+ 3 autres</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="h-6 w-6 rounded-full border-2 border-white dark:border-zinc-900" alt="" />
                  ))}
                </div>
                <span className="font-medium">1,247 événements réussis</span>
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900">
                <Shield className="h-3.5 w-3.5" /> Prestataires vérifiés • Admin 24/7
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-5xl">
            <SearchBar 
              onSearch={setQuery} 
              onCategoryChange={setCategory} 
              onProvinceChange={setProvince}
              activeCategory={category}
              activeProvince={province}
            />
          </div>

          {/* Stats RDC */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 rounded-[20px] border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-4 sm:gap-6 sm:p-6">
            {[
              { icon: MapPin, label: "Provinces couvertes", value: "8", sub: "Goma, Bukavu, Kin..." },
              { icon: Shield, label: "Prestataires approuvés", value: "93%", sub: "Validation admin" },
              { icon: Zap, label: "Réservation moyenne", value: "< 30s", sub: "Automatique" },
              { icon: Phone, label: "Support RDC", value: "24/7", sub: "+243 976 459 970" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black sm:h-10 sm:w-10">
                  <stat.icon className="h-4 w-4" />
                </div>
                <div className="mt-2 text-lg font-bold tracking-tight sm:text-xl">{stat.value}</div>
                <div className="text-[11px] font-semibold text-zinc-900 dark:text-white sm:text-xs">{stat.label}</div>
                <div className="text-[10px] text-zinc-500">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Provinces */}
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-[11px]">
            <span className="font-medium text-zinc-500">Présent à :</span>
            {provinces.map(p => (
              <span key={p.id} className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium dark:bg-zinc-800">
                {p.name} ({p.capital}) • {p.count} prestataires
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
              <PartyPopper className="h-5 w-5 text-violet-600" />
              {query ? `Résultats pour "${query}"` : province !== 'all' ? `Prestataires ${provinces.find(p=>p.id===province)?.name}` : category === "all" ? "Recommandé pour vous en RDC" : `Catégorie ${category}`}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              {filtered.length} service{filtered.length > 1 ? 's' : ''} • {filtered.filter(s=>s.provider.adminApproved).length} approuvés par admin • Trié par popularité
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
            <h3 className="mt-4 font-semibold">Aucun prestataire trouvé</h3>
            <p className="mt-1 text-sm text-zinc-500">Essayez une autre province ou catégorie. Ou contactez-nous pour trouver un prestataire.</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { setQuery(""); setCategory("all"); setProvince("all") }}>
                Réinitialiser
              </Button>
              <a href="tel:+243976459970">
                <Button size="sm" className="gap-2"><Phone className="h-4 w-4" /> +243 976 459 970</Button>
              </a>
            </div>
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

        {/* How it works RDC */}
        <div className="mt-20 rounded-[32px] bg-zinc-900 p-8 text-white dark:bg-white dark:text-black sm:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium dark:bg-black/10">
              <Shield className="h-3.5 w-3.5" /> Modèle avec validation admin
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Comment réserver en RDC ?</h2>
            <p className="mt-3 text-sm text-white/60 dark:text-black/60">Spécialement conçu pour le marché congolais : Mobile Money, support Swahili/Français, prestataires locaux vérifiés.</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-4">
            {[
              { step: "01", title: "Cherchez", desc: "Par catégorie (salle, traiteur, sono...) et province (Goma, Kin, L'shi...).", icon: "🔍" },
              { step: "02", title: "Réservez", desc: "Date, invités, type d'événement. Paiement acompte 30% via M-Pesa, Orange Money, Airtel.", icon: "📅" },
              { step: "03", title: "Admin valide", desc: "Notre admin vérifie le prestataire et confirme sous 2h. Prestataire vous appelle sous 30 min.", icon: "✅" },
              { step: "04", title: "Célébrez", desc: "Le jour J, tout est prêt. Support WhatsApp 24/7: +243 976 459 970", icon: "🎉" },
            ].map(item => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold opacity-10">{item.step}</div>
                <div className="mt-2 text-2xl">{item.icon}</div>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60 dark:text-black/60">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 dark:bg-black/5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Award className="h-4 w-4" /> Prestataires vérifiés</div>
              <p className="mt-1 text-xs text-white/60 dark:text-black/60">Chaque prestataire est visité physiquement, photos vérifiées, CNI, références clients.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 dark:bg-black/5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Phone className="h-4 w-4" /> Support local</div>
              <p className="mt-1 text-xs text-white/60 dark:text-black/60">Équipe à Goma, Kinshasa, Lubumbashi. Français, Swahili, Lingala. WhatsApp 24/7.</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 dark:bg-black/5">
              <div className="flex items-center gap-2 text-sm font-semibold"><Check className="h-4 w-4" /> Paiement sécurisé</div>
              <p className="mt-1 text-xs text-white/60 dark:text-black/60">Mobile Money + garantie remboursement si prestataire no-show. Contrat inclus.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex items-center gap-6 rounded-full bg-white/10 px-6 py-3 text-xs dark:bg-black/10">
              <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> 4.9/5 (847 avis RDC)</span>
              <span className="h-4 w-px bg-white/20 dark:bg-black/20" />
              <span>🇨🇩 8 provinces</span>
            </div>
            <a href="tel:+243976459970">
              <Button variant="secondary" size="sm" className="gap-2 bg-white text-black hover:bg-zinc-100 dark:bg-black dark:text-white">
                <Phone className="h-4 w-4" /> Appeler support: +243 976 459 970
              </Button>
            </a>
          </div>
        </div>

        {/* CTA prestataire */}
        <div className="mt-12 rounded-[24px] border border-dashed border-zinc-300 bg-gradient-to-r from-violet-50 to-blue-50 p-8 dark:border-zinc-700 dark:from-violet-950/20 dark:to-blue-950/20 sm:p-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-lg font-bold">Vous êtes prestataire en RDC ? Salle, traiteur, DJ, déco...</h3>
              <p className="mt-1 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
                Rejoignez 150+ prestataires. Exposez vos services, recevez des réservations automatisées. Validation admin sous 24h, commission 10% seulement.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white px-2.5 py-1 border dark:bg-zinc-900">✅ Profil vérifié</span>
                <span className="rounded-full bg-white px-2.5 py-1 border dark:bg-zinc-900">📸 Photos pro</span>
                <span className="rounded-full bg-white px-2.5 py-1 border dark:bg-zinc-900">💰 Paiement Mobile Money</span>
              </div>
            </div>
            <Link href="/providers" className="shrink-0">
              <Button size="lg" className="gap-2 rounded-full">
                Devenir prestataire <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
