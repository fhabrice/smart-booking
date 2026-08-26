"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Shield, Phone, MapPin, Sparkles, Upload, Award, Users, Clock, Star } from "lucide-react"
import { provinces, categories } from "@/lib/data"

export default function ProvidersPage() {
  const [form, setForm] = useState({
    businessName: "",
    category: "salles",
    province: "nord-kivu",
    city: "Goma",
    phone: "",
    description: "",
  })

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> 150+ prestataires déjà inscrits • Commission 10% seulement
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            Devenez prestataire <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Smart Booking Event RDC</span>
          </h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Salle de fête, traiteur, décoration, sono, DJ, photo, animateur, location matériel... Exposez vos services dans toute la RDC et recevez des réservations automatisées.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            <span className="rounded-full bg-white border px-3 py-1.5 dark:bg-zinc-900">📍 8 provinces</span>
            <span className="rounded-full bg-white border px-3 py-1.5 dark:bg-zinc-900">✅ Validation admin 24h</span>
            <span className="rounded-full bg-white border px-3 py-1.5 dark:bg-zinc-900">💰 Paiement Mobile Money</span>
            <span className="rounded-full bg-white border px-3 py-1.5 dark:bg-zinc-900">📞 Support Goma 24/7</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Form */}
          <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Sparkles className="h-5 w-5 text-violet-600" /> Inscription prestataire
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Remplissez ce formulaire, notre admin à Goma vous contacte sous 24h pour validation physique.</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-semibold">Nom de votre entreprise / service *</label>
                <input
                  value={form.businessName}
                  onChange={e => setForm({...form, businessName: e.target.value})}
                  placeholder="Ex: Serena Events Goma, Mama Kivu Traiteur..."
                  className="mt-1 w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold">Catégorie *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="mt-1 w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-800"
                  >
                    {categories.filter(c=>c.id!=='all').map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Province *</label>
                  <select
                    value={form.province}
                    onChange={e => setForm({...form, province: e.target.value})}
                    className="mt-1 w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-800"
                  >
                    {provinces.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.capital}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold">Ville *</label>
                  <input
                    value={form.city}
                    onChange={e => setForm({...form, city: e.target.value})}
                    placeholder="Goma, Bukavu, Kinshasa..."
                    className="mt-1 w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">WhatsApp / Téléphone *</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">🇨🇩</span>
                    <input
                      value={form.phone}
                      onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="+243 976 459 970"
                      className="w-full rounded-full border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Décrivez vos services *</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Ex: Salle 500 places climatisée, parking sécurisé, groupe électrogène, cuisine traiteur... 8 ans d'expérience, 340 événements..."
                  rows={4}
                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm dark:border-zinc-800 dark:bg-zinc-800"
                />
              </div>

              <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-center dark:border-zinc-700">
                <Upload className="mx-auto h-6 w-6 text-zinc-400" />
                <div className="mt-2 text-sm font-medium">Photos de vos réalisations</div>
                <div className="text-xs text-zinc-500">Glissez 3-5 photos (salle, buffet, déco, sono...) - Max 5MB</div>
                <Button variant="outline" size="sm" className="mt-3 rounded-full">Choisir fichiers</Button>
              </div>

              <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/20">
                <div className="flex gap-2">
                  <Shield className="h-5 w-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-blue-900 dark:text-blue-200">Processus validation admin (24h)</div>
                    <ul className="mt-2 space-y-1 text-xs text-blue-800 dark:text-blue-300 list-disc pl-4">
                      <li>Admin vérifie vos photos, CNI, et références</li>
                      <li>Visite physique si vous êtes à Goma/Bukavu/Kin/Lubumbashi</li>
                      <li>Appel vidéo pour provinces éloignées</li>
                      <li>Badge "Admin approuvé" + mise en ligne</li>
                      <li>Vous recevez réservations automatiques + paiement Mobile Money</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button size="lg" className="w-full gap-2 rounded-full">
                <Check className="h-4 w-4" /> Soumettre pour validation admin
              </Button>

              <div className="text-center text-[11px] text-zinc-500">
                En soumettant, vous acceptez nos CGU prestataire. Commission 10% par réservation réussie. Paiement 48h après événement via Mobile Money. Support: +243 976 459 970
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="rounded-[24px] bg-zinc-900 p-6 text-white dark:bg-white dark:text-black">
              <h3 className="font-semibold flex items-center gap-2"><Award className="h-5 w-5" /> Pourquoi rejoindre Smart Booking Event ?</h3>
              <div className="mt-4 space-y-4">
                {[
                  { icon: Users, title: "Clients qualifiés", desc: "1,247 événements en RDC. Clients qui cherchent vraiment un prestataire, pas juste curieux." },
                  { icon: Clock, title: "Zéro appel perdu", desc: "Réservation automatique même la nuit. Vous recevez SMS + WhatsApp instantané." },
                  { icon: Shield, title: "Paiement garanti", desc: "Acompte 30% bloqué par admin. Solde garanti si vous honorez. Litige géré par admin." },
                  { icon: Star, title: "Visibilité nationale", desc: "De Goma à Kinshasa. 8 provinces. Votre profil visible par toute la diaspora qui organise à distance." },
                ].map(item => (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 dark:bg-black/10">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="text-xs text-white/60 dark:text-black/60">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-white/10 p-4 dark:bg-black/5">
                <div className="text-sm font-bold">Témoignage prestataire</div>
                <div className="mt-2 text-xs leading-relaxed text-white/70 dark:text-black/70">
                  "Depuis que je suis sur Smart Booking Event, je reçois 15 réservations par mois sans prospecter. Admin très pro, paiement Mobile Money rapide. J'ai doublé mon chiffre." 
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop" className="h-6 w-6 rounded-full" alt="" />
                  <span className="text-xs font-medium">Serena Events Goma • 340 événements</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold">📍 Couverture RDC</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {provinces.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-full bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-zinc-500">{p.count} prestataires</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs dark:bg-emerald-950/20">
                <span className="font-semibold text-emerald-800 dark:text-emerald-200">🇨🇩 Bientôt : </span>
                <span className="text-emerald-700 dark:text-emerald-300">Kisangani, Kananga, Mbuji-Mayi, Kolwezi... Objectif 26 provinces d'ici fin 2026.</span>
              </div>
            </div>

            <div className="rounded-[24px] border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950/20">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2"><Phone className="h-4 w-4" /> Contact admin direct</h3>
              <p className="mt-2 text-sm text-blue-800 dark:text-blue-300">
                Une question ? Notre admin à Goma répond en 5 minutes.
              </p>
              <div className="mt-4 space-y-2">
                <a href="tel:+243976459970" className="flex items-center justify-center gap-2 rounded-full bg-blue-600 py-2.5 text-sm font-bold text-white">
                  <Phone className="h-4 w-4" /> +243 976 459 970 (Appel)
                </a>
                <a href="https://wa.me/243976459970" target="_blank" className="flex items-center justify-center gap-2 rounded-full bg-green-600 py-2.5 text-sm font-bold text-white">
                  WhatsApp Direct
                </a>
              </div>
              <div className="mt-3 text-[11px] text-blue-700 dark:text-blue-300 text-center">
                Français • Swahili • Lingala • Disponible 7j/7, 8h-22h
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
