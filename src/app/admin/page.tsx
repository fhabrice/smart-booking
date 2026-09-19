"use client"

import { useState } from "react"
import Link from "next/link"
import { useProviderSpace, useMergedServices } from "@/lib/provider-context"
import { useBookings } from "@/lib/booking-context"
import { useMessages } from "@/lib/messages-context"
import { formatPrice, formatPriceFC } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Users,
  Store,
  TrendingUp,
  Clock,
  Check,
  X,
  MessageSquare,
  Sparkles,
  Phone,
  Smartphone,
} from "lucide-react"

function generateTransactionRef(method: string): string {
  const prefix = method === "M-Pesa" ? "MPESA" : method === "Orange Money" ? "OM" : "AIRTEL"
  const suffix = Date.now().toString().slice(-6)
  return `${prefix}-${suffix}-RDC`
}

export default function AdminDashboardPage() {
  const {
    accounts,
    updateAccountStatus,
    approveService,
    rejectService,
    payoutRequests,
    processPayout,
    rejectPayout,
  } = useProviderSpace()
  const allServices = useMergedServices()
  const { bookings } = useBookings()
  const { getAllAdminThreads } = useMessages()

  // Prestataires
  const pendingAccounts = accounts.filter((a) => a.status === "pending")
  const approvedAccounts = accounts.filter((a) => a.status === "approved")
  const suspendedAccounts = accounts.filter((a) => a.status === "suspended")

  // Prestations en attente de validation admin
  const pendingServices = allServices.filter(
    (s) => !s.isDeleted && s.adminApprovalStatus === "pending"
  )
  const approvedServices = allServices.filter(
    (s) => !s.isDeleted && s.adminApprovalStatus === "approved"
  )

  // Retraits Mobile Money en attente
  const pendingPayouts = (payoutRequests || []).filter(
    (p) => p.status === "pending" || p.status === "processing"
  )

  // Finances globales
  const confirmedBookings = bookings.filter((b) => b.status !== "cancelled")
  const globalVolume = confirmedBookings.reduce((sum, b) => sum + b.price, 0)
  const platformCommission = Math.round(globalVolume * 0.1) // 10%

  const adminThreads = getAllAdminThreads()

  // Quick payout validation state
  const [quickPayRef, setQuickPayRef] = useState<Record<string, string>>({})

  const handleQuickValidatePayout = (id: string, method: string) => {
    const existing = quickPayRef[id]
    const ref =
      existing && existing.trim()
        ? existing.trim()
        : generateTransactionRef(method)
    processPayout(id, ref)
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            🛡️ Tableau de Bord Super-Admin
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Gestion de la Plateforme RDC</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Contrôle des prestataires, modération des publications et supervision des flux de cérémonies.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/payouts">
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <Smartphone className="h-4 w-4 text-emerald-600" /> Retraits Mobile Money ({pendingPayouts.length})
            </Button>
          </Link>
          <Link href="/admin/services">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600">
              <Store className="h-4 w-4" /> Modérer les prestations ({pendingServices.length})
            </Button>
          </Link>
          <Link href="/admin/providers">
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" /> Prestataires ({pendingAccounts.length})
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>Prestataires Partenaires</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black">{accounts.length}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="font-bold text-emerald-600">{approvedAccounts.length} validés</span>
            <span>•</span>
            <span className="font-bold text-amber-600">{pendingAccounts.length} en attente</span>
            {suspendedAccounts.length > 0 && (
              <>
                <span>•</span>
                <span className="font-bold text-red-600">{suspendedAccounts.length} suspendus</span>
              </>
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>Prestations en ligne</span>
            <Store className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black">{approvedServices.length}</div>
          <div className="mt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            {pendingServices.length} publication{pendingServices.length > 1 ? "s" : ""} à valider
          </div>
        </div>

        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>Volume d&apos;affaires global</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black">{formatPrice(globalVolume)}</div>
          <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
            ≈ {formatPriceFC(globalVolume)}
          </div>
        </div>

        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
            <span>Commissions Smart Booking (10%)</span>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatPrice(platformCommission)}
          </div>
          <div className="text-[11px] font-medium text-purple-700 dark:text-purple-300">
            ≈ {formatPriceFC(platformCommission)}
          </div>
        </div>
      </div>

      {/* File d'attente 1 : Prestataires en attente de validation */}
      {pendingAccounts.length > 0 && (
        <div className="rounded-[28px] border border-amber-300 bg-amber-50/60 p-6 dark:border-amber-900/50 dark:bg-amber-950/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-base text-amber-950 dark:text-amber-100">
                  Nouveaux prestataires à valider ({pendingAccounts.length})
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                  Ces professionnels viennent de s&apos;inscrire. Vérifiez leur identité et acceptez leur adhésion.
                </p>
              </div>
            </div>
            <Link href="/admin/providers" className="text-xs font-bold text-amber-800 underline dark:text-amber-300">
              Voir tous →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {pendingAccounts.map((provider) => (
              <div
                key={provider.id}
                className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {provider.category}
                      </span>
                      <h4 className="font-bold text-sm mt-1">{provider.name}</h4>
                      <div className="text-xs text-zinc-500">Contact : {provider.contactPerson}</div>
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400">
                      {provider.city} ({provider.location})
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    <Phone className="h-3 w-3 text-zinc-400" /> {provider.phone}
                    {provider.rccm && <span>• RCCM : {provider.rccm}</span>}
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-500 line-clamp-2">{provider.bio}</p>
                </div>

                <div className="mt-4 flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <Button
                    size="sm"
                    onClick={() => updateAccountStatus(provider.name, "approved")}
                    className="flex-1 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Accepter le prestataire
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateAccountStatus(provider.name, "suspended", "Dossier incomplet")}
                    className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <X className="h-3.5 w-3.5" /> Refuser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File d'attente 2 : Prestations en attente d'approbation */}
      {pendingServices.length > 0 && (
        <div className="rounded-[28px] border border-blue-200 bg-blue-50/50 p-6 dark:border-blue-900/50 dark:bg-blue-950/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-bold text-base text-blue-950 dark:text-blue-100">
                  Prestations soumises à approbation ({pendingServices.length})
                </h3>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/80">
                  Vérifiez la conformité des prix et des descriptions avant mise en ligne sur la vitrine client.
                </p>
              </div>
            </div>
            <Link href="/admin/services" className="text-xs font-bold text-blue-800 underline dark:text-blue-300">
              Gérer toutes →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {pendingServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-col justify-between rounded-2xl border border-blue-100 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex gap-3">
                  <img src={service.image} alt="" className="h-16 w-16 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {service.category}
                    </span>
                    <h4 className="font-bold text-xs truncate mt-0.5">{service.name}</h4>
                    <div className="text-[11px] text-zinc-500">Par : {service.provider.name}</div>
                    <div className="mt-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                      {formatPrice(service.price)} {service.priceUnit}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <Button
                    size="sm"
                    onClick={() => approveService(service.id)}
                    className="flex-1 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Approuver & Publier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      rejectService(service.id, "Description insuffisante ou tarif à préciser")
                    }
                    className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <X className="h-3.5 w-3.5" /> Rejeter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File d'attente 3 : Retraits Mobile Money en attente */}
      {pendingPayouts.length > 0 && (
        <div className="rounded-[28px] border border-emerald-300 bg-emerald-50/60 p-6 dark:border-emerald-900/50 dark:bg-emerald-950/20 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-base text-emerald-950 dark:text-emerald-100">
                  Demandes de Retraits Mobile Money ({pendingPayouts.length})
                </h3>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                  Les prestataires ont demandé le virement de leurs acomptes vers leur numéro M-Pesa, Orange ou Airtel.
                </p>
              </div>
            </div>
            <Link href="/admin/payouts" className="text-xs font-bold text-emerald-800 underline dark:text-emerald-300">
              Voir tous les retraits →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {pendingPayouts.map((payout) => (
              <div
                key={payout.id}
                className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {payout.method}
                      </span>
                      <h4 className="font-bold text-sm mt-1">{payout.providerName}</h4>
                      <div className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">
                        {payout.phoneNumber}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {formatPrice(payout.amountUSD)}
                      </div>
                      <div className="text-[11px] font-semibold text-zinc-500">
                        ≈ {formatPriceFC(payout.amountUSD)}
                      </div>
                    </div>
                  </div>

                  {payout.notes && (
                    <p className="mt-2 text-xs text-zinc-500 italic bg-zinc-50 p-2 rounded-xl dark:bg-zinc-800/50">
                      Motif : &ldquo;{payout.notes}&rdquo;
                    </p>
                  )}

                  <div className="mt-2">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      Réf. Mobile Money (facultatif / auto si vide)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: MPESA-738912-RDC"
                      value={quickPayRef[payout.id] || ""}
                      onChange={(e) =>
                        setQuickPayRef((prev) => ({ ...prev, [payout.id]: e.target.value }))
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 text-xs font-mono font-bold focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                  </div>
                </div>

                <div className="mt-3 flex gap-2 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                  <Button
                    size="sm"
                    onClick={() => handleQuickValidatePayout(payout.id, payout.method)}
                    className="flex-1 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Check className="h-3.5 w-3.5" /> Valider virement Mobile Money
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectPayout(payout.id, "Numéro ou titulaire non conforme")}
                    className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <X className="h-3.5 w-3.5" /> Rejeter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages récents des prestataires */}
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-base">Derniers messages des prestataires</h3>
          </div>
          <Link href="/admin/messages" className="text-xs font-bold text-amber-600 underline">
            Ouvrir la messagerie →
          </Link>
        </div>

        {adminThreads.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4">Aucun message de prestataire pour le moment.</p>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {adminThreads.slice(0, 3).map((t) => (
              <div key={t.threadId} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-bold text-xs truncate">{t.providerName}</div>
                  <div className="text-xs text-zinc-500 truncate">{t.lastMessage.content}</div>
                </div>
                <Link href="/admin/messages">
                  <Button size="sm" variant="outline" className="text-xs">
                    Répondre
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
