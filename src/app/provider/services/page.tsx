"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useProviderSpace, useProviderServices } from "@/lib/provider-context"
import { useBookings } from "@/lib/booking-context"
import { categories, cities, categoryName } from "@/lib/data"
import { formatPrice, formatPriceFC, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Plus,
  Pencil,
  Check,
  X,
  Play,
  Pause,
  Zap,
  Trash2,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Clock,
  AlertCircle,
} from "lucide-react"

const priceUnits = [
  "la prestation",
  "la journée",
  "la soirée",
  "l'événement",
  "l'après-midi",
  "par invité",
  "le couple",
  "la mariée + cortège",
  "le gâteau 3 étages",
]

const availableImages = [
  "/images/hall-1.jpg",
  "/images/hall-2.jpg",
  "/images/garden-1.jpg",
  "/images/food-1.jpg",
  "/images/food-2.jpg",
  "/images/deco-1.jpg",
  "/images/deco-2.jpg",
  "/images/sono-1.jpg",
  "/images/sono-2.jpg",
  "/images/photo-1.jpg",
  "/images/photo-2.jpg",
  "/images/beauty-1.jpg",
  "/images/beauty-2.jpg",
  "/images/mode-1.jpg",
  "/images/mode-2.jpg",
  "/images/car-1.jpg",
  "/images/car-2.jpg",
  "/images/band-1.jpg",
  "/images/choir-1.jpg",
  "/images/kids-1.jpg",
  "/images/kids-2.jpg",
  "/images/trad-1.jpg",
]

export default function ProviderServicesPage() {
  const { session, currentAccount, updateService, addService, removeService } = useProviderSpace()
  const { bookings } = useBookings()
  const providerServices = useProviderServices(session ?? "")

  const [showForm, setShowForm] = useState(false)
  const [editingPrice, setEditingPrice] = useState<string | null>(null)
  const [priceValue, setPriceValue] = useState("")
  const [created, setCreated] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Formulaire nouvelle prestation
  const [name, setName] = useState("")
  const [category, setCategory] = useState("salles")
  const [city, setCity] = useState("Kinshasa")
  const [location, setLocation] = useState("")
  const [price, setPrice] = useState("")
  const [priceUnit, setPriceUnit] = useState("la prestation")
  const [description, setDescription] = useState("")
  const [features, setFeatures] = useState("")
  const [image, setImage] = useState(availableImages[0])
  const [formError, setFormError] = useState("")

  const myBookings = useMemo(
    () => bookings.filter((b) => b.providerName === session),
    [bookings, session]
  )

  if (!session) return null

  const handleCreate = async () => {
    const trimmedName = name.trim()
    const numPrice = Number(price)
    if (!trimmedName) return setFormError("Donnez un nom à votre prestation.")
    if (!numPrice || numPrice <= 0) return setFormError("Indiquez un prix en USD (ex : 150).")
    if (description.trim().length < 10) return setFormError("Ajoutez une courte description (10 caractères min).")
    if (!location.trim()) return setFormError("Indiquez votre commune ou quartier.")

    const identity = {
      name: session,
      avatar: currentAccount?.avatar || "/images/avatar-1.jpg",
      verified: currentAccount?.verified || false,
      experience: currentAccount?.experience || "Prestataire vérifié Smart Booking",
      rating: currentAccount?.rating || 4.9,
    }

    setSubmitting(true)
    setFormError("")
    try {
      const service = await addService({
        name: trimmedName,
        category,
        description: description.trim(),
        longDescription: description.trim(),
        price: Math.round(numPrice),
        priceUnit,
        duration: 240,
        rating: 5,
        reviews: 0,
        image,
        images: [image],
        provider: identity,
        city,
        location: location.trim(),
        features: features
          .split(/[,;\n]/)
          .map((f) => f.trim())
          .filter(Boolean)
          .slice(0, 6),
        instant: true,
        custom: true,
        adminApprovalStatus: "pending", // En attente de modération admin
      })

      setCreated(service.name)
      setShowForm(false)
      setName("")
      setPrice("")
      setDescription("")
      setFeatures("")
      setLocation("")
      setTimeout(() => setCreated(null), 5000)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur lors de la publication.")
    } finally {
      setSubmitting(false)
    }
  }

  const savePrice = (serviceId: string) => {
    const numPrice = Number(priceValue)
    if (numPrice && numPrice > 0) {
      void updateService(serviceId, { price: Math.round(numPrice) }).catch(() => {})
    }
    setEditingPrice(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes prestations</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {providerServices.length} prestation{providerServices.length > 1 ? "s" : ""} gérée
            {providerServices.length > 1 ? "s" : ""} • Les nouvelles publications sont soumises à validation admin
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/services">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
              <ShieldCheck className="h-4 w-4 text-amber-600" /> Modération Admin
            </Button>
          </Link>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="gap-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600"
          >
            <Plus className="h-4 w-4" /> Publier une prestation
          </Button>
        </div>
      </div>

      {/* Bannière de confirmation de création avec mention validation admin */}
      {created && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs dark:border-amber-900/50 dark:bg-amber-950/30 animate-in fade-in">
          <Clock className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900 dark:text-amber-200">
              Prestation &quot;{created}&quot; soumise avec succès !
            </div>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300">
              Elle est actuellement <strong>en attente d&apos;approbation par l&apos;administrateur</strong>. Une fois validée par nos équipes de modération, elle sera automatiquement publiée sur la vitrine publique pour tous les organisateurs d&apos;événements.
            </p>
          </div>
        </div>
      )}

      {/* Formulaire nouvelle prestation */}
      {showForm && (
        <div className="mt-6 rounded-[28px] border border-amber-200 bg-white p-6 shadow-xl dark:border-amber-500/30 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-white">
                <Plus className="h-4 w-4" />
              </div>
              <h2 className="font-bold">Créer & soumettre une prestation</h2>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-amber-50/60 p-3 text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Processus d&apos;approbation : Votre prestation sera examinée par l&apos;admin sous 24h avant d&apos;apparaître dans le catalogue client.</span>
          </div>

          {formError && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {formError}
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold">Titre de la prestation *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Décoration florale complète table d'honneur & allée"
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="text-xs font-semibold">Catégorie *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              >
                {categories
                  .filter((c) => c.id !== "all")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold">Ville *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.province})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold">Commune / quartier *</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex : Gombe, Av. de la Justice"
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold">Prix en USD *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="250"
                  className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Unité</label>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-2 text-xs font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
                >
                  {priceUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold">Description détaillée *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Ce qui est inclus, matériel apporté, conditions d'installation…"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold">Points forts (séparés par des virgules)</label>
              <input
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Fleurs fraîches, Éclairage LED, Démontage inclus, Transport pris en charge"
                className="mt-1 h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-xs font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold">Photo illustrative</label>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {availableImages.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setImage(img)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      image === img ? "border-amber-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={() => void handleCreate()}
              disabled={submitting}
              className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 font-bold disabled:opacity-60"
            >
              {submitting ? "Publication en cours…" : "Soumettre à la modération admin"}
            </Button>
          </div>
        </div>
      )}

      {/* Liste des prestations */}
      <div className="mt-6 grid gap-4">
        {providerServices.map((service) => {
          const bookingsForService = myBookings.filter((b) => b.serviceId === service.id)
          const isApprovalPending = service.adminApprovalStatus === "pending"
          const isRejected = service.adminApprovalStatus === "rejected"
          const isApproved = service.adminApprovalStatus === "approved" || (!service.custom && !isRejected && !isApprovalPending)

          return (
            <div
              key={service.id}
              className={cn(
                "rounded-[24px] border bg-white p-5 transition-all dark:bg-zinc-900",
                service.paused ? "border-zinc-200 opacity-75" : "border-zinc-200 hover:shadow-md dark:border-zinc-800"
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-36">
                  <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* BADGES STATUT APPROBATION ADMIN */}
                        {isApprovalPending ? (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                            <Clock className="h-3 w-3" /> En attente approbation admin
                          </span>
                        ) : isRejected ? (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-800 dark:bg-red-950/60 dark:text-red-300">
                            <ShieldAlert className="h-3 w-3" /> Rejeté par l&apos;admin
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <ShieldCheck className="h-3 w-3" /> Approuvé & En ligne
                          </span>
                        )}

                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {categoryName(service.category)}
                        </span>

                        {service.paused && (
                          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                            En pause
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1.5 truncate text-base font-bold">{service.name}</h3>
                      <p className="line-clamp-2 mt-0.5 text-xs text-zinc-500">{service.description}</p>
                    </div>

                    <div className="text-right">
                      {editingPrice === service.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            defaultValue={service.price}
                            onChange={(e) => setPriceValue(e.target.value)}
                            className="h-8 w-20 rounded-lg border border-amber-400 px-2 text-sm font-bold focus:outline-none"
                            autoFocus
                          />
                          <Button size="sm" className="h-8 px-2" onClick={() => savePrice(service.id)}>
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditingPrice(null)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="group/price flex items-baseline justify-end gap-1">
                          <span className="text-lg font-bold">{formatPrice(service.price)}</span>
                          <span className="text-xs text-zinc-500">{service.priceUnit}</span>
                          <button
                            onClick={() => {
                              setEditingPrice(service.id)
                              setPriceValue(String(service.price))
                            }}
                            className="ml-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            title="Modifier le prix"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                      <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        ≈ {formatPriceFC(service.price)}
                      </div>
                    </div>
                  </div>

                  {/* Motif si rejeté */}
                  {isRejected && service.adminFeedback && (
                    <div className="mt-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-800 dark:bg-red-950/40 dark:text-red-300">
                      <strong>Motif du refus admin :</strong> {service.adminFeedback}
                    </div>
                  )}

                  {/* Actions & contrôles */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                      <span>{service.city} ({service.location})</span>
                      <span>•</span>
                      <span>{bookingsForService.length} réservation{bookingsForService.length > 1 ? "s" : ""}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs"
                        onClick={() => void updateService(service.id, { paused: !service.paused }).catch(() => {})}
                      >
                        {service.paused ? (
                          <>
                            <Play className="h-3 w-3 text-emerald-600" /> Reprendre
                          </>
                        ) : (
                          <>
                            <Pause className="h-3 w-3 text-zinc-500" /> Mettre en pause
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs"
                        onClick={() => void updateService(service.id, { instant: !service.instant }).catch(() => {})}
                      >
                        <Zap className={cn("h-3 w-3", service.instant ? "text-amber-500" : "text-zinc-400")} />
                        {service.instant ? "Instantanée ON" : "Instantanée OFF"}
                      </Button>

                      {isApproved && (
                        <Link href={`/services/${service.id}`}>
                          <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs">
                            <Eye className="h-3 w-3" /> Voir sur vitrine
                          </Button>
                        </Link>
                      )}

                      {service.custom && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          onClick={() => void removeService(service.id).catch(() => {})}
                        >
                          <Trash2 className="h-3 w-3" /> Supprimer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
