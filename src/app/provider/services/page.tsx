"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useProviderSpace, useProviderServices } from "@/lib/provider-context"
import { useBookings } from "@/lib/booking-context"
import { categories, cities, categoryName, services as catalogServices } from "@/lib/data"
import { formatPrice, formatPriceFC, cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Store,
  Plus,
  Pencil,
  Check,
  X,
  Play,
  Pause,
  Zap,
  Trash2,
  Eye,
  TrendingUp,
  Star,
  ArrowLeft,
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
  const { session, setOverride, addCustomService, removeCustomService } = useProviderSpace()
  const { bookings } = useBookings()
  const providerServices = useProviderServices(session ?? "")

  const [showForm, setShowForm] = useState(false)
  const [editingPrice, setEditingPrice] = useState<string | null>(null)
  const [priceValue, setPriceValue] = useState("")
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [created, setCreated] = useState<string | null>(null)

  // Formulaire nouvelle prestation
  const [name, setName] = useState("")
  const [category, setCategory] = useState("salles")
  const [city, setCity] = useState("Kinshasa")
  const [location, setLocation] = useState("")
  const [price, setPrice] = useState("")
  const [priceUnit, setPriceUnit] = useState("la prestation")
  const [durationHours, setDurationHours] = useState(4)
  const [description, setDescription] = useState("")
  const [features, setFeatures] = useState("")
  const [image, setImage] = useState(availableImages[0])
  const [instant, setInstant] = useState(true)
  const [formError, setFormError] = useState("")

  const myBookings = useMemo(
    () => bookings.filter((b) => b.providerName === session),
    [bookings, session]
  )

  if (!session) return null

  const handleCreate = () => {
    const trimmedName = name.trim()
    const numPrice = Number(price)
    if (!trimmedName) return setFormError("Donnez un nom à votre prestation.")
    if (!numPrice || numPrice <= 0) return setFormError("Indiquez un prix en USD (ex : 150).")
    if (description.trim().length < 10) return setFormError("Ajoutez une courte description (10 caractères min).")
    if (!location.trim()) return setFormError("Indiquez votre commune ou quartier.")

    const identity =
      catalogServices.find((s) => s.provider.name === session)?.provider ?? {
        name: session,
        avatar: "/images/avatar-1.jpg",
        verified: true,
        experience: "Prestataire vérifié Smart Booking",
        rating: 4.9,
      }

    const service = addCustomService({
      name: trimmedName,
      category,
      description: description.trim(),
      longDescription: description.trim(),
      price: Math.round(numPrice),
      priceUnit,
      duration: durationHours * 60,
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
      instant,
      custom: true,
    })

    setCreated(service.name)
    setShowForm(false)
    setName("")
    setPrice("")
    setDescription("")
    setFeatures("")
    setLocation("")
    setFormError("")
    setTimeout(() => setCreated(null), 4000)
  }

  const savePrice = (serviceId: string) => {
    const numPrice = Number(priceValue)
    if (numPrice && numPrice > 0) {
      setOverride(serviceId, { price: Math.round(numPrice) })
    }
    setEditingPrice(null)
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes prestations</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {providerServices.length} prestation{providerServices.length > 1 ? "s" : ""} •{" "}
            {providerServices.filter((s) => !s.paused).length} en ligne •{" "}
            {providerServices.filter((s) => s.paused).length} en pause
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Annuler
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Ajouter une prestation
            </>
          )}
        </Button>
      </div>

      {created && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          <Check className="h-4 w-4" /> « {created} » est en ligne ! Vos clients peuvent déjà la réserver.
        </div>
      )}

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="mt-6 rounded-[24px] border border-amber-200 bg-white p-6 dark:border-amber-500/30 dark:bg-zinc-900 sm:p-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-white">
              <Plus className="h-4 w-4" />
            </div>
            <h2 className="font-semibold">Nouvelle prestation</h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-500">Nom de la prestation *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Salle climatisée 200 places — Gombe"
                className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500">Catégorie *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:[&>option]:bg-zinc-900"
              >
                {categories
                  .filter((c) => c.id !== "all")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500">Ville *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:[&>option]:bg-zinc-900"
              >
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500">Commune / quartier *</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex : Gombe · Av. du 24 novembre"
                className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500">Prix USD *</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="numeric"
                  placeholder="150"
                  className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500">Unité</label>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:[&>option]:bg-zinc-900"
                >
                  {priceUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500">Durée sur place</label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:[&>option]:bg-zinc-900"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((h) => (
                  <option key={h} value={h}>
                    {h}h
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-500">Description courte *</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex : Salle climatisée avec scène, parking gardé et groupe électrogène"
                className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-500">
                Points forts (séparés par des virgules)
              </label>
              <input
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Ex : Climatisation, Parking gardé 40 voitures, Hôtesses incluses"
                className="mt-1.5 h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium placeholder:text-zinc-400 focus:border-amber-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-500">Photo de la prestation</label>
              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                {availableImages.map((img) => (
                  <button
                    key={img}
                    onClick={() => setImage(img)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-xl border-2 transition-all",
                      image === img
                        ? "border-amber-500 ring-2 ring-amber-300"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    {image === img && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800 sm:col-span-2">
              <input
                type="checkbox"
                checked={instant}
                onChange={(e) => setInstant(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
              <span className="text-sm">
                <span className="font-semibold">Réservation instantanée ⚡</span>
                <span className="block text-xs text-zinc-500">
                  Sinon, chaque demande attendra votre confirmation (moins de 2h recommandé)
                </span>
              </span>
            </label>
          </div>

          {formError && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 dark:bg-red-950/30">
              {formError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} className="gap-2 bg-gradient-to-r from-amber-500 to-red-500">
              <Check className="h-4 w-4" /> Publier la prestation
            </Button>
          </div>
        </div>
      )}

      {/* Liste des prestations */}
      <div className="mt-6 grid gap-4">
        {providerServices.map((service) => {
          const serviceBookings = myBookings.filter((b) => b.serviceId === service.id && b.status !== "cancelled")
          const revenue = serviceBookings.reduce((sum, b) => sum + b.price, 0)
          const isEditing = editingPrice === service.id
          return (
            <div
              key={service.id}
              className={cn(
                "overflow-hidden rounded-[24px] border bg-white transition-all dark:bg-zinc-900",
                service.paused
                  ? "border-zinc-100 dark:border-zinc-800/60"
                  : "border-zinc-200 hover:shadow-lg dark:border-zinc-800"
              )}
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-40 w-full shrink-0 sm:h-auto sm:w-52">
                  <img src={service.image} alt={service.name} className="h-full w-full object-cover" />
                  <div className="absolute left-3 top-3">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm backdrop-blur",
                        service.paused
                          ? "bg-zinc-900/80 text-white"
                          : "bg-emerald-500/90 text-white"
                      )}
                    >
                      {service.paused ? "⏸ En pause" : "● En ligne"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                          {categoryName(service.category)}
                        </span>
                        {service.instant && (
                          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold shadow-sm dark:bg-zinc-800">
                            ⚡ Instantané
                          </span>
                        )}
                        {service.custom && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                            Créée par vous
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1.5 font-semibold leading-tight">{service.name}</h3>
                      <p className="mt-1 line-clamp-1 text-sm text-zinc-500">{service.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {service.rating.toFixed(1)}
                        </span>
                        <span>
                          {service.city} · {service.location}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            value={priceValue}
                            onChange={(e) => setPriceValue(e.target.value)}
                            inputMode="numeric"
                            className="h-9 w-24 rounded-full border border-amber-400 bg-white px-3 text-sm font-bold focus:outline-none dark:bg-zinc-900"
                          />
                          <Button size="sm" className="h-9 gap-1 text-xs" onClick={() => savePrice(service.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 text-xs"
                            onClick={() => setEditingPrice(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPrice(service.id)
                            setPriceValue(String(service.price))
                          }}
                          className="group flex items-center gap-1.5 rounded-2xl px-2 py-1 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                          <span className="text-lg font-bold">{formatPrice(service.price)}</span>
                          <Pencil className="h-3.5 w-3.5 text-zinc-300 group-hover:text-amber-500" />
                        </button>
                      )}
                      <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                        ≈ {formatPriceFC(service.price)} · {service.priceUnit}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-zinc-50 px-4 py-2.5 text-xs dark:bg-zinc-800/50">
                    <span className="flex items-center gap-1.5 font-medium">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> {formatPrice(revenue)} générés
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500">
                      {serviceBookings.length} réservation{serviceBookings.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant={service.paused ? "default" : "outline"}
                      className={cn("h-9 gap-1.5 text-xs", !service.paused && "text-amber-700 dark:text-amber-300")}
                      onClick={() => setOverride(service.id, { paused: !service.paused })}
                    >
                      {service.paused ? (
                        <>
                          <Play className="h-3.5 w-3.5" /> Remettre en ligne
                        </>
                      ) : (
                        <>
                          <Pause className="h-3.5 w-3.5" /> Mettre en pause
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 gap-1.5 text-xs"
                      onClick={() => setOverride(service.id, { instant: !service.instant })}
                    >
                      <Zap
                        className={cn(
                          "h-3.5 w-3.5",
                          service.instant ? "text-amber-500" : "text-zinc-400"
                        )}
                      />
                      {service.instant ? "Instantané activé" : "Instantané désactivé"}
                    </Button>
                    <Link href={`/services/${service.id}`}>
                      <Button size="sm" variant="ghost" className="h-9 gap-1.5 text-xs">
                        <Eye className="h-3.5 w-3.5" /> Voir la vitrine
                      </Button>
                    </Link>
                    {service.custom && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 gap-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => {
                          if (confirmDelete === service.id) {
                            removeCustomService(service.id)
                            setConfirmDelete(null)
                          } else {
                            setConfirmDelete(service.id)
                            setTimeout(() => setConfirmDelete(null), 3000)
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {confirmDelete === service.id ? "Confirmer la suppression ?" : "Supprimer"}
                      </Button>
                    )}
                  </div>
                  {service.paused && (
                    <p className="mt-3 text-xs text-zinc-500">
                      ⏸ En pause : la prestation est masquée du catalogue client, personne ne peut la réserver.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {providerServices.length === 0 && (
          <div className="rounded-[32px] border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Store className="h-7 w-7 text-zinc-400" />
            </div>
            <h3 className="mt-5 font-semibold">Aucune prestation</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">
              Créez votre première prestation pour apparaître dans le catalogue Smart Booking.
            </p>
            <Button onClick={() => setShowForm(true)} className="mt-5 gap-2 bg-gradient-to-r from-amber-500 to-red-500">
              <Plus className="h-4 w-4" /> Ajouter une prestation
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link
          href="/provider/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
