"use client"

import { useState } from "react"
import { useProviderSpace } from "@/lib/provider-context"
import { ProviderAccount, ProviderStatus } from "@/lib/types"
import { cities, categories } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  Users,
  Search,
  Check,
  X,
  Pencil,
  Trash2,
  BadgeCheck,
  Phone,
  Plus,
  Clock,
} from "lucide-react"

export default function AdminProvidersPage() {
  const { accounts, updateAccountStatus, updateAccount, deleteAccount, registerProvider } =
    useProviderSpace()

  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | ProviderStatus>("all")

  // Modal édition
  const [editingProvider, setEditingProvider] = useState<ProviderAccount | null>(null)
  const [editName, setEditName] = useState("")
  const [editContact, setEditContact] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editCity, setEditCity] = useState("Kinshasa")
  const [editRating, setEditRating] = useState("4.9")
  const [editVerified, setEditVerified] = useState(true)

  // Modal création manuelle
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState("")
  const [newContact, setNewContact] = useState("")
  const [newPhone, setNewPhone] = useState("+243 ")
  const [newCity, setNewCity] = useState("Kinshasa")
  const [newLocation, setNewLocation] = useState("")
  const [newCategory, setNewCategory] = useState("salles")

  const filtered = accounts
    .filter((a) => filter === "all" || a.status === filter)
    .filter(
      (a) =>
        !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        a.city.toLowerCase().includes(search.toLowerCase()) ||
        a.phone.includes(search)
    )

  const handleOpenEdit = (p: ProviderAccount) => {
    setEditingProvider(p)
    setEditName(p.name)
    setEditContact(p.contactPerson)
    setEditPhone(p.phone)
    setEditCity(p.city)
    setEditRating(String(p.rating))
    setEditVerified(p.verified)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProvider) return

    updateAccount(editingProvider.name, {
      name: editName.trim(),
      contactPerson: editContact.trim(),
      phone: editPhone.trim(),
      city: editCity,
      rating: Number(editRating) || 4.9,
      verified: editVerified,
    })

    setEditingProvider(null)
  }

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    registerProvider({
      name: newName.trim(),
      contactPerson: newContact.trim() || "Responsable",
      phone: newPhone.trim() || "+243 800 000 000",
      whatsapp: newPhone.trim() || "+243 800 000 000",
      email: `${newName.toLowerCase().replace(/\s+/g, "")}@example.cd`,
      city: newCity,
      location: newLocation.trim() || "Centre-ville",
      category: newCategory,
      experience: "Prestataire vérifié",
      bio: `Prestataire professionnel ${newCategory} à ${newCity}.`,
      status: "approved",
      verified: true,
    })

    setShowAddModal(false)
    setNewName("")
    setNewContact("")
    setNewLocation("")
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <Users className="h-3.5 w-3.5" /> Modération Administrateur
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Gestion des Prestataires</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Acceptez, suspendez, modifiez ou enlevez des prestataires inscrits sur Smart Booking RDC.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          className="gap-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-xs font-bold"
        >
          <Plus className="h-4 w-4" /> Ajouter un prestataire
        </Button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["all", "pending", "approved", "suspended"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                filter === s
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {s === "all"
                ? `Tous (${accounts.length})`
                : s === "pending"
                ? `En attente (${accounts.filter((a) => a.status === "pending").length})`
                : s === "approved"
                ? `Approuvés (${accounts.filter((a) => a.status === "approved").length})`
                : `Suspendus (${accounts.filter((a) => a.status === "suspended").length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, ville, tél…"
            className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-10 pr-4 text-xs font-medium focus:border-amber-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
          />
        </div>
      </div>

      {/* Tableau des prestataires */}
      <div className="rounded-[28px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50 font-bold text-zinc-600 dark:text-zinc-300">
                <th className="py-3 px-4">Établissement</th>
                <th className="py-3 px-4">Responsable & Contact</th>
                <th className="py-3 px-4">Ville & Commune</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((provider) => (
                <tr key={provider.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/40">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-sm font-bold text-white">
                        {provider.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 font-bold text-sm">
                          <span>{provider.name}</span>
                          {provider.verified && <BadgeCheck className="h-4 w-4 text-emerald-500" />}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Catégorie : <span className="font-semibold">{provider.category}</span> • Note :{" "}
                          {provider.rating.toFixed(1)}/5
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                    <div className="font-semibold">{provider.contactPerson}</div>
                    <div className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {provider.phone}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-300">
                    <div className="font-semibold">{provider.city}</div>
                    <div className="text-[11px] text-zinc-500">{provider.location}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        provider.status === "approved"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : provider.status === "pending"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      }`}
                    >
                      {provider.status === "approved" ? (
                        <>
                          <Check className="h-3 w-3" /> Approuvé
                        </>
                      ) : provider.status === "pending" ? (
                        <>
                          <Clock className="h-3 w-3" /> En attente
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3" /> Suspendu
                        </>
                      )}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {provider.status !== "approved" && (
                        <Button
                          size="sm"
                          onClick={() => updateAccountStatus(provider.name, "approved")}
                          className="h-8 gap-1 text-[11px] bg-emerald-600 hover:bg-emerald-700"
                          title="Accepter le prestataire"
                        >
                          <Check className="h-3 w-3" /> Accepter
                        </Button>
                      )}

                      {provider.status !== "suspended" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAccountStatus(provider.name, "suspended")}
                          className="h-8 gap-1 text-[11px] text-amber-700 hover:bg-amber-50 dark:text-amber-400"
                          title="Suspendre / Enlever de la vitrine"
                        >
                          Suspendre
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(provider)}
                        className="h-8 p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                        title="Modifier le prestataire"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteAccount(provider.name)}
                        className="h-8 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MODIFICATION PRESTATAIRE */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-bold mb-4">Modifier le profil prestataire</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nom commercial</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nom du contact</label>
                <input
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Téléphone</label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  required
                />
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
                  <label className="block font-semibold mb-1">Note (sur 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editRating}
                    onChange={(e) => setEditRating(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="verifiedCheck"
                  checked={editVerified}
                  onChange={(e) => setEditVerified(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="verifiedCheck" className="font-semibold cursor-pointer">
                  Badge Prestataire Vérifié (Certifié RDC)
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingProvider(null)}>
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

      {/* MODAL AJOUT MANUEL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full rounded-[28px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-base font-bold mb-4">Créer un nouveau prestataire</h3>

            <form onSubmit={handleCreateNew} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Nom de l&apos;établissement *</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex : Kivu Palace Events"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nom du contact *</label>
                <input
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  placeholder="Ex : Joseph Kasongo"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Ville</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
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
                  <label className="block font-semibold mb-1">Catégorie</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
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

              <div>
                <label className="block font-semibold mb-1">Téléphone</label>
                <input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+243 8xx xxx xxx"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 font-medium dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  Annuler
                </Button>
                <Button type="submit" size="sm" className="bg-gradient-to-r from-amber-500 to-red-500">
                  Créer le prestataire
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
