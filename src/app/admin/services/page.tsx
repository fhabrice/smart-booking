"use client"

import { useState } from "react"
import { useProviderSpace, useMergedServices } from "@/lib/provider-context"
import { Service } from "@/lib/types"
import { categories, cities, categoryName } from "@/lib/data"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Store,
  Search,
  Check,
  X,
  Pencil,
  Trash2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  MapPin,
} from "lucide-react"

export default function AdminServicesPage() {
  const { approveService, rejectService, updateServiceAdmin, deleteService } = useProviderSpace()
  const allServices = useMergedServices()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "paused">("all")

  // Modal rejet
  const [rejectModalService, setRejectModalService] = useState<Service | null>(null)
  const [rejectFeedback, setRejectFeedback] = useState("")

  // Modal édition
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editCategory, setEditCategory] = useState("salles")
  const [editCity, setEditCity] = useState("Kinshasa")
  const [editLocation, setEditLocation] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const activeServices = allServices.filter((s) => !s.isDeleted)

  const filtered = activeServices
    .filter((s) => {
      if (filter === "all") return true
      if (filter === "paused") return !!s.paused
      if (filter === "pending") return s.adminApprovalStatus === "pending"
      if (filter === "approved") return s.adminApprovalStatus === "approved"
      if (filter === "rejected") return s.adminApprovalStatus === "rejected"
      return true
    })
    .filter(
      (s) =>
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.provider.name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    )

  const handleOpenEdit = (s: Service) => {
    setEditingService(s)
    setEditName(s.name)
    setEditPrice(String(s.price))
    setEditCategory(s.category)
    setEditCity(s.city)
    setEditLocation(s.location)
    setEditDescription(s.description)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return

    updateServiceAdmin(editingService.id, {
      name: editName.trim(),
      price: Number(editPrice) || editingService.price,
      category: editCategory,
      city: editCity,
      location: editLocation.trim(),
      description: editDescription.trim(),
    })

    setEditingService(null)
  }

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModalService) return

    rejectService(
      rejectModalService.id,
      rejectFeedback.trim() || "Prestation non conforme aux critères Smart Booking RDC"
    )

    setRejectModalService(null)
    setRejectFeedback("")
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <Store className="h-3.5 w-3.5" /> Modération des Publications
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Modération des Services</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Approuvez la mise en vitrine, modifiez les tarifs ou supprimez les prestations non conformes.
          </p>
        </div>
      </div>

      {/* Filtres & Recherche */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: `Tous (${activeServices.length})` },
            {
              id: "pending",
              label: `🟡 À valider (${activeServices.filter((s) => s.adminApprovalStatus === "pending").length})`,
            },
            {
              id: "approved",
              label: `🟢 Approuvés (${activeServices.filter((s) => s.adminApprovalStatus === "approved").length})`,
            },
            {
              id: "rejected",
              label: `🔴 Rejetés (${activeServices.filter((s) => s.adminApprovalStatus === "rejected").length})`,
            },
            {
              id: "paused",
              label: `En pause (${activeServices.filter((s) => s.paused).length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                filter === tab.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre, prestataire…"
            className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-10 pr-4 text-xs font-medium focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Liste des services */}
      <div className="rounded-[28px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50 font-bold text-zinc-600 dark:text-zinc-300">
                <th className="py-3 px-4">Prestation</th>
                <th className="py-3 px-4">Prestataire & Ville</th>
                <th className="py-3 px-4">Tarif</th>
                <th className="py-3 px-4">Statut Approbation</th>
                <th className="py-3 px-4 text-right">Actions Modération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((service) => {
                const isPending = service.adminApprovalStatus === "pending"
                const isApproved = service.adminApprovalStatus === "approved"
                const isRejected = service.adminApprovalStatus === "rejected"

                return (
                  <tr key={service.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={service.image}
                          alt=""
                          className="h-12 w-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {categoryName(service.category)}
                          </span>
                          <div className="font-bold text-xs truncate max-w-xs mt-0.5">{service.name}</div>
                          <div className="text-[11px] text-zinc-400 line-clamp-1">{service.description}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-zinc-800 dark:text-zinc-200">{service.provider.name}</div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {service.city} ({service.location})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold">{formatPrice(service.price)}</div>
                      <div className="text-[10px] text-zinc-400">{service.priceUnit}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : isPending
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {isApproved ? (
                            <>
                              <ShieldCheck className="h-3 w-3" /> En vitrine
                            </>
                          ) : isPending ? (
                            <>
                              <Clock className="h-3 w-3" /> À valider
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="h-3 w-3" /> Refusé
                            </>
                          )}
                        </span>

                        {service.paused && (
                          <span className="block text-[10px] text-zinc-400 font-semibold">⏸️ Prestataire en pause</span>
                        )}
                        {isRejected && service.adminFeedback && (
                          <div className="text-[10px] text-red-600 line-clamp-1 italic max-w-xs">
                            Motif : {service.adminFeedback}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isApproved && (
                          <Button
                            size="sm"
                            onClick={() => approveService(service.id)}
                            className="h-8 gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-700"
                            title="Approuver la mise en ligne"
                          >
                            <Check className="h-3 w-3" /> Approuver
                          </Button>
                        )}

                        {!isRejected && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectModalService(service)}
                            className="h-8 gap-1 text-[11px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            title="Rejeter la publication"
                          >
                            <X className="h-3 w-3" /> Refuser
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(service)}
                          className="h-8 p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300"
                          title="Modifier la prestation"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteService(service.id)}
                          className="h-8 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          title="Supprimer / Enlever du catalogue"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL REFUS AVEC FEEDBACK */}
      {rejectModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-bold mb-2">Rejeter la prestation</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Indiquez la raison du refus à <strong>{rejectModalService.provider.name}</strong> pour lui permettre de corriger sa fiche.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Motif de modération *</label>
                <textarea
                  value={rejectFeedback}
                  onChange={(e) => setRejectFeedback(e.target.value)}
                  placeholder="Ex : Veuillez préciser les options incluses dans la formule ou ajuster le tarif USD…"
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setRejectModalService(null)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold">
                  Confirmer le rejet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MODIFICATION PRESTATION */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-bold mb-4">Modifier la prestation (Admin)</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Titre de la prestation</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Prix en USD</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Catégorie</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {categories.filter((c) => c.id !== "all").map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Ville</label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Commune / Lieu</label>
                  <input
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingService(null)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" className="bg-zinc-900 text-white dark:bg-white dark:text-black">
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
