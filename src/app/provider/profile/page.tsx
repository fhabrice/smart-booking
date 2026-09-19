"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useProviderSpace, useProviderServices, useProviderProfile } from "@/lib/provider-context"
import { useBookings } from "@/lib/booking-context"
import { formatPrice, cn } from "@/lib/utils"
import { paymentMethods } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  BadgeCheck,
  Star,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Wallet,
  Check,
  Store,
  TrendingUp,
  CalendarCheck,
  ArrowLeft,
  Smartphone,
  Award,
} from "lucide-react"

export default function ProviderProfilePage() {
  const { session, currentAccount, updateProfile, updateAccount } = useProviderSpace()
  const { bookings } = useBookings()
  const providerServices = useProviderServices(session ?? "")
  const savedProfile = useProviderProfile(session)

  const [phone, setPhone] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [email, setEmail] = useState("")
  const [bio, setBio] = useState("")
  const [payoutMethod, setPayoutMethod] = useState("M-Pesa")
  const [payoutNumber, setPayoutNumber] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhone(savedProfile.phone ?? currentAccount?.phone ?? "")
    setWhatsapp(savedProfile.whatsapp ?? currentAccount?.whatsapp ?? "")
    setEmail(savedProfile.email ?? currentAccount?.email ?? "")
    setBio(savedProfile.bio ?? currentAccount?.bio ?? "")
    setPayoutMethod(savedProfile.payoutMethod ?? currentAccount?.payoutMethod ?? "M-Pesa")
    setPayoutNumber(savedProfile.payoutNumber ?? currentAccount?.payoutNumber ?? "")
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!session) return null

  const myBookings = bookings.filter((b) => b.providerName === session && b.status !== "cancelled")
  const volume = myBookings.reduce((sum, b) => sum + b.price, 0)
  const identity =
    providerServices[0]?.provider ?? { name: session, verified: true, experience: "Prestataire", rating: 4.9 }

  const handleSave = () => {
    updateProfile(session, {
      phone: phone.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      email: email.trim() || undefined,
      bio: bio.trim() || undefined,
      payoutMethod,
      payoutNumber: payoutNumber.trim() || undefined,
    })
    // Met à jour aussi le compte officiel : c'est lui qui sert au routage
    // des paiements clients vers le numéro / compte du prestataire.
    updateAccount(session, {
      phone: phone.trim() || currentAccount?.phone || "",
      whatsapp: whatsapp.trim() || currentAccount?.whatsapp || "",
      email: email.trim() || currentAccount?.email || "",
      bio: bio.trim() || currentAccount?.bio || "",
      payoutMethod,
      payoutNumber: payoutNumber.trim() || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profil & paiements</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Vos coordonnées sont transmises aux clients après confirmation d&apos;une réservation.
          </p>
        </div>
      </div>

      {/* Carte identité */}
      <div className="mt-6 overflow-hidden rounded-[28px] bg-zinc-900 p-6 text-white dark:bg-zinc-800 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-2xl font-bold">
              {session.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{session}</h2>
                <BadgeCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
                <span className="flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-amber-400" /> {identity.experience}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {providerServices[0]?.city ?? "RDC"}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {identity.rating.toFixed(1)}/5
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <Store className="mx-auto h-4 w-4 text-amber-300" />
              <div className="mt-1 text-lg font-bold">{providerServices.length}</div>
              <div className="text-[10px] text-white/50">Prestations</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <CalendarCheck className="mx-auto h-4 w-4 text-emerald-300" />
              <div className="mt-1 text-lg font-bold">{myBookings.length}</div>
              <div className="text-[10px] text-white/50">Réservations</div>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <TrendingUp className="mx-auto h-4 w-4 text-red-300" />
              <div className="mt-1 text-lg font-bold">{formatPrice(volume)}</div>
              <div className="text-[10px] text-white/50">Volume total</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Coordonnées */}
        <section className="rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="flex items-center gap-2 font-semibold">
            <Phone className="h-4 w-4 text-zinc-400" /> Coordonnées
          </h3>
          <div className="mt-5 grid gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500">Téléphone (+243)</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+243 81 234 56 78"
                className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500">WhatsApp Business</label>
              <div className="relative mt-1.5">
                <MessageCircle className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+243 82 145 78 96"
                  className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500">Email</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@monactivite.cd"
                  className="h-11 w-full rounded-2xl border border-zinc-200 bg-white pl-11 pr-4 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500">Présentation (visible sur votre vitrine)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Ex : Spécialistes des mariages et dotations à Kinshasa depuis 15 ans…"
                className="mt-1.5 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
          </div>
        </section>

        {/* Paiements */}
        <section className="grid content-start gap-6">
          <div className="rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="flex items-center gap-2 font-semibold">
              <Wallet className="h-4 w-4 text-zinc-400" /> Compte de réception des paiements
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Les paiements des clients (acompte de 50% et solde) sont versés directement sur le compte
              ci-dessous. Il est communiqué au client au moment du règlement : gardez-le à jour.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPayoutMethod(method.name)}
                  className={cn(
                    "rounded-2xl border p-3 text-center transition-all",
                    payoutMethod === method.name
                      ? "border-amber-400 bg-amber-50 ring-2 ring-amber-300 dark:border-amber-500/50 dark:bg-amber-500/10"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800"
                  )}
                >
                  <Smartphone className="mx-auto h-4 w-4 text-zinc-500" />
                  <div className="mt-1.5 text-[11px] font-bold leading-tight">{method.name}</div>
                  <div className="text-[9px] text-zinc-400">{method.desc}</div>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold text-zinc-500">Numéro / compte de réception</label>
              <input
                value={payoutNumber}
                onChange={(e) => setPayoutNumber(e.target.value)}
                placeholder={paymentMethods.find((p) => p.name === payoutMethod)?.hint ?? "+243 8x xxx xxx"}
                className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/60 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <h3 className="flex items-center gap-2 font-semibold">
              <Check className="h-4 w-4 text-emerald-500" /> Vérification du compte
            </h3>
            <ul className="mt-3 grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              {[
                "Identité et registre de commerce vérifiés",
                "Numéro Mobile Money confirmé",
                "Au moins 1 prestation publiée",
                "Délai de réponse inférieur à 2h",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-400">
              ✓ Compte vérifié — le badge « Prestataire vérifié » rassure vos clients.
            </p>
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/provider/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>
        <Button onClick={handleSave} className="gap-2 bg-gradient-to-r from-amber-500 to-red-500">
          {saved ? (
            <>
              <Check className="h-4 w-4" /> Enregistré ✓
            </>
          ) : (
            "Enregistrer mes informations"
          )}
        </Button>
      </div>
    </div>
  )
}
