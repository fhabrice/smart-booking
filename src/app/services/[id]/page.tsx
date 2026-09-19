"use client"

import { useParams, useSearchParams } from "next/navigation"
import { categoryName } from "@/lib/data"
import { useMergedServices, useProviderProfile } from "@/lib/provider-context"
import { useCart } from "@/lib/cart-context"
import { useMessages } from "@/lib/messages-context"
import { formatPrice, formatPriceFC, isoDay, minBookableDate } from "@/lib/utils"
import {
  Star,
  MapPin,
  Clock,
  Shield,
  Check,
  ArrowLeft,
  Heart,
  Share2,
  Award,
  Sparkles,
  Users,
  Phone,
  PauseCircle,
  ShoppingBag,
  MessageCircle,
  Send,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { BookingWidget } from "@/components/booking-widget"
import { Button } from "@/components/ui/button"
import { Suspense, useState } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const reviews = [
  {
    name: "Chantal K.",
    text: "Prestation impeccable pour notre mariage à Gombe. Invités bluffés, et tout était prêt à l'heure. Je recommande à 100%.",
    rating: 5,
    ceremony: "Mariage · Kinshasa",
  },
  {
    name: "Jean-Bosco M.",
    text: "Réservé en 30 secondes, payé l'acompte en M-Pesa sans stress. Le jour J, équipe sérieuse et souriante. Bravo !",
    rating: 5,
    ceremony: "Dotation · Lubumbashi",
  },
  {
    name: "Esther & Patrick",
    text: "3e prestation réservée via Smart Booking pour la doto de notre fille. Toujours aussi fiable, rapport qualité-prix au top.",
    rating: 5,
    ceremony: "Baptême · Goma",
  },
]

function ServicePageContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("event") ?? undefined
  const id = params.id as string
  const services = useMergedServices()
  const service = services.find((s) => s.id === id)
  const providerProfile = useProviderProfile(service?.provider.name ?? null)
  const [liked, setLiked] = useState(false)

  // Panier / Devis
  const { addItem, isInCart } = useCart()
  const inCart = service ? isInCart(service.id) : false
  const [addedNotice, setAddedNotice] = useState(false)
  // Date choisie dans le widget de réservation, transmise au panier / devis
  const [chosenDate, setChosenDate] = useState<string>(() => isoDay(minBookableDate()))

  // Messagerie Client <-> Prestataire
  const { sendMessage, getClientProviderThread } = useMessages()
  const [showChat, setShowChat] = useState(false)
  const [chatName, setChatName] = useState("")
  const [chatPhone, setChatPhone] = useState("")
  const [chatMessage, setChatMessage] = useState("")
  const [sentNotice, setSentNotice] = useState(false)

  if (!service) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Service introuvable</h1>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    )
  }

  const threadMessages = getClientProviderThread(service.provider.name, chatPhone || "visiteur")

  const handleAddToCart = () => {
    addItem(service, chosenDate)
    setAddedNotice(true)
    setTimeout(() => setAddedNotice(false), 3000)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return
    const sender = chatName.trim() || "Client intéressé"
    const phone = chatPhone.trim() || "Non renseigné"
    sendMessage({
      threadId: `cp-${service.provider.name}-${chatPhone || "visiteur"}`,
      fromRole: "client",
      fromName: `${sender} (${phone})`,
      toRole: "provider",
      toName: service.provider.name,
      content: chatMessage.trim(),
      serviceId: service.id,
    })
    setChatMessage("")
    setSentNotice(true)
    setTimeout(() => setSentNotice(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" /> Retour aux prestataires
          </Link>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleAddToCart}
              variant={inCart ? "secondary" : "outline"}
              className="gap-2"
            >
              <ShoppingBag className="h-4 w-4 text-amber-600" />
              {inCart ? "Déjà dans mon panier / devis" : "Ajouter au devis"}
            </Button>
            {inCart && (
              <Link href="/cart">
                <Button size="sm" className="gap-2 bg-gradient-to-r from-amber-500 to-red-500">
                  Voir mon panier & Devis →
                </Button>
              </Link>
            )}
          </div>
        </div>

        {addedNotice && (
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2">
            <span className="flex items-center gap-2">
              <Check className="h-4 w-4" /> Prestation ajoutée à votre devis multi-services !
            </span>
            <Link href="/cart" className="underline font-bold text-white hover:opacity-90">
              Ouvrir le devis →
            </Link>
          </div>
        )}

        {service.paused && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <PauseCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Cette prestation est temporairement en pause — le prestataire a suspendu les réservations.
              Consultez d&apos;autres prestataires vérifiés dans la même catégorie.
            </p>
          </div>
        )}

        {service.adminApprovalStatus === "pending" && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Prestation en cours de validation administrative Smart Booking.
            </p>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
          {/* Left */}
          <div>
            {/* Gallery */}
            <div className="overflow-hidden rounded-[24px] bg-white dark:bg-zinc-900">
              <div className="relative aspect-[16/10]">
                <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
                <div className="absolute left-4 top-4 flex gap-2">
                  {service.popular && (
                    <div className="rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-3 py-1 text-xs font-semibold text-white">
                      🔥 Populaire
                    </div>
                  )}
                  {service.instant && (
                    <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur">
                      ⚡ Instantané
                    </div>
                  )}
                </div>
                <div className="absolute right-4 top-4 flex gap-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur"
                    aria-label="Favori"
                  >
                    <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur" aria-label="Partager">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                      {categoryName(service.category)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3 rounded-full bg-emerald-500 p-0.5 text-white" /> Vérifié •{" "}
                      {service.provider.experience}
                    </span>
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

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800">
                  <img src={service.provider.avatar} className="h-6 w-6 rounded-full object-cover" alt="" />
                  <span className="font-medium">{service.provider.name}</span>
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <MapPin className="h-4 w-4" /> {service.city} · {service.location}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Clock className="h-4 w-4" /> {Math.round(service.duration / 60)}h sur place
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Shield className="h-4 w-4" /> Annulation gratuite 72h
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold">À propos</h3>
                <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">{service.longDescription}</p>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold">Inclus dans la formule</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {service.features.map((feat) => (
                    <div
                      key={feat}
                      className="flex items-center gap-2 rounded-full bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/50"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3 w-3" />
                      </div>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-red-50 p-4 dark:border-amber-900/50 dark:from-amber-950/20 dark:to-red-950/20">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Conseil Smart Booking RDC</div>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      Pour une cérémonie sans imprévu : réservez cette prestation au moins 3 semaines à l&apos;avance. Acompte garanti de 50% en Mobile Money (M-Pesa, Orange Money, Airtel Money), solde réglé sur place le jour J.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Messagerie Client <-> Prestataire */}
            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Une question pour {service.provider.name} ?</h3>
                    <p className="text-xs text-zinc-500">Posez vos questions sur la logistique, le menu ou les horaires</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowChat(!showChat)}
                >
                  {showChat ? "Masquer la messagerie" : "Écrire un message"}
                </Button>
              </div>

              {showChat && (
                <div className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 animate-in fade-in">
                  {threadMessages.length > 0 && (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {threadMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            msg.fromRole === "client" ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm ${
                              msg.fromRole === "client"
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                                : "border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                            }`}
                          >
                            <div className="text-[10px] font-bold opacity-75 mb-0.5">{msg.fromName}</div>
                            <div>{msg.content}</div>
                          </div>
                          <span className="mt-1 text-[10px] text-zinc-400">
                            {format(new Date(msg.createdAt), "d MMM à HH:mm", { locale: fr })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="space-y-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        value={chatName}
                        onChange={(e) => setChatName(e.target.value)}
                        placeholder="Votre nom complet"
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                        required
                      />
                      <input
                        value={chatPhone}
                        onChange={(e) => setChatPhone(e.target.value)}
                        placeholder="Votre tél / WhatsApp (+243...)"
                        type="tel"
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder={`Message pour ${service.provider.name}…`}
                        className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
                      />
                      <Button type="submit" size="sm" className="gap-1 bg-amber-600 hover:bg-amber-700 text-xs">
                        <Send className="h-3.5 w-3.5" /> Envoyer
                      </Button>
                    </div>
                  </form>

                  {sentNotice && (
                    <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      ✓ Votre message a été transmis au prestataire ! Il vous répondra par notification et sur WhatsApp.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="mt-6 rounded-[24px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
              <h3 className="font-semibold">Avis clients • {service.reviews}</h3>
              <div className="mt-4 grid gap-4">
                {reviews.map((review, i) => (
                  <div key={i} className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{review.name}</span>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{review.text}</p>
                    <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                      <Users className="h-3 w-3" /> {review.ceremony}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Booking widget */}
          <div>
            <BookingWidget service={service} defaultEventId={eventId} onDateChange={setChosenDate} />

            <div className="mt-4 rounded-[20px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <img src={service.provider.avatar} className="h-10 w-10 rounded-full object-cover" alt="" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">{service.provider.name}</div>
                  <div className="text-xs text-zinc-500">Répond en ~5 min • {service.provider.experience}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-bold">{formatPrice(service.price)}</div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400">≈ {formatPriceFC(service.price)}</div>
                </div>
              </div>
              {(providerProfile.phone || providerProfile.whatsapp) && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  {providerProfile.phone && (
                    <span className="flex items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1.5 text-xs font-medium dark:bg-zinc-800">
                      <Phone className="h-3 w-3 text-zinc-400" /> {providerProfile.phone}
                    </span>
                  )}
                  {providerProfile.whatsapp && (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      WhatsApp : {providerProfile.whatsapp}
                    </span>
                  )}
                  {providerProfile.bio && (
                    <span className="line-clamp-1 text-xs text-zinc-500">{providerProfile.bio}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ServicePage() {
  return (
    <Suspense>
      <ServicePageContent />
    </Suspense>
  )
}
