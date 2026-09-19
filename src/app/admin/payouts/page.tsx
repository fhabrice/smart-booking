"use client"

import { useState, useMemo } from "react"
import { useProviderSpace } from "@/lib/provider-context"
import { formatPrice, formatPriceFC } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Smartphone,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Check,
  X,
} from "lucide-react"
import { format } from "date-fns"

function createPayoutRef(method: string): string {
  const prefix = method === "M-Pesa" ? "MPESA" : method === "Orange Money" ? "OM" : "AIRTEL"
  const code = Date.now().toString().slice(-6)
  return `${prefix}-${code}-RDC`
}

export default function AdminPayoutsPage() {
  const { payoutRequests, processPayout, rejectPayout } = useProviderSpace()

  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "paid" | "rejected">("all")
  const [filterMethod, setFilterMethod] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal Validation Virement
  const [validatingPayoutId, setValidatingPayoutId] = useState<string | null>(null)
  const [transactionRefInput, setTransactionRefInput] = useState("")

  // Modal Rejet
  const [rejectingPayoutId, setRejectingPayoutId] = useState<string | null>(null)
  const [rejectReasonInput, setRejectReasonInput] = useState("")

  const filteredPayouts = useMemo(() => {
    return payoutRequests.filter((p) => {
      if (filterStatus === "pending" && p.status !== "pending" && p.status !== "processing") return false
      if (filterStatus === "paid" && p.status !== "paid" && p.status !== "processed") return false
      if (filterStatus === "rejected" && p.status !== "rejected") return false

      if (filterMethod !== "all" && p.method !== filterMethod) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = p.providerName.toLowerCase().includes(q)
        const matchPhone = p.phoneNumber.includes(q)
        const matchRef = p.transactionRef?.toLowerCase().includes(q)
        if (!matchName && !matchPhone && !matchRef) return false
      }

      return true
    })
  }, [payoutRequests, filterStatus, filterMethod, searchQuery])

  // KPIs
  const totalPaidOut = payoutRequests
    .filter((p) => p.status === "paid" || p.status === "processed")
    .reduce((sum, p) => sum + p.amountUSD, 0)

  const pendingPayouts = payoutRequests.filter(
    (p) => p.status === "pending" || p.status === "processing"
  )
  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amountUSD, 0)

  // Actions
  const handleStartValidation = (payoutId: string, method: string) => {
    setValidatingPayoutId(payoutId)
    setTransactionRefInput(createPayoutRef(method))
  }

  const handleConfirmValidation = (payoutId: string) => {
    if (!transactionRefInput.trim()) return
    processPayout(payoutId, transactionRefInput.trim())
    setValidatingPayoutId(null)
    setTransactionRefInput("")
  }

  const handleStartReject = (payoutId: string) => {
    setRejectingPayoutId(payoutId)
    setRejectReasonInput("Numéro de compte non conforme ou indisponible.")
  }

  const handleConfirmReject = (payoutId: string) => {
    rejectPayout(payoutId, rejectReasonInput.trim())
    setRejectingPayoutId(null)
    setRejectReasonInput("")
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Smartphone className="h-3.5 w-3.5" /> Trésorerie Prestataires RDC
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Retraits Mobile Money
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Validez et exécutez les virements des acomptes aux prestataires de cérémonies (M-Pesa, Orange Money, Airtel Money).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>En attente de virement</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatPrice(totalPending)}
          </div>
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-300 mt-0.5">
            ≈ {formatPriceFC(totalPending)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 font-bold">
            {pendingPayouts.length} demande{pendingPayouts.length > 1 ? "s" : ""} à valider
          </div>
        </div>

        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Total viré aux prestataires</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatPrice(totalPaidOut)}
          </div>
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">
            ≈ {formatPriceFC(totalPaidOut)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400 font-bold">
            {payoutRequests.filter((p) => p.status === "paid" || p.status === "processed").length} virements honorés
          </div>
        </div>

        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Opérateurs RDC</span>
            <Smartphone className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-3 text-xs space-y-1">
            <div className="flex justify-between font-bold">
              <span>Vodacom M-Pesa :</span>
              <span className="text-zinc-700 dark:text-zinc-300">
                {payoutRequests.filter((p) => p.method === "M-Pesa").length}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Orange Money :</span>
              <span className="text-zinc-700 dark:text-zinc-300">
                {payoutRequests.filter((p) => p.method === "Orange Money").length}
              </span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Airtel Money :</span>
              <span className="text-zinc-700 dark:text-zinc-300">
                {payoutRequests.filter((p) => p.method === "Airtel Money").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        {/* Onglets Statut */}
        <div className="flex flex-wrap gap-1">
          {[
            { id: "all", label: "Tous", count: payoutRequests.length },
            { id: "pending", label: "En attente", count: pendingPayouts.length },
            {
              id: "paid",
              label: "Payés",
              count: payoutRequests.filter((p) => p.status === "paid" || p.status === "processed").length,
            },
            {
              id: "rejected",
              label: "Rejetés",
              count: payoutRequests.filter((p) => p.status === "rejected").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as "all" | "pending" | "paid" | "rejected")}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                filterStatus === tab.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Filtres Opérateur & Recherche */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
          >
            <option value="all">Tous les opérateurs RDC</option>
            <option value="M-Pesa">Vodacom M-Pesa</option>
            <option value="Orange Money">Orange Money</option>
            <option value="Airtel Money">Airtel Money</option>
          </select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Prestataire, tél, réf…"
              className="rounded-xl border border-zinc-200 bg-zinc-50 pl-8 pr-3 py-1.5 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>
        </div>
      </div>

      {/* Tableau des demandes */}
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        {filteredPayouts.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            <Smartphone className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
            Aucune demande de retrait correspondant à ces critères.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50 font-bold text-zinc-600 dark:text-zinc-300">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Prestataire Partenaire</th>
                  <th className="py-3 px-3">Opérateur & Numéro</th>
                  <th className="py-3 px-3 text-right">Montant USD</th>
                  <th className="py-3 px-3 text-right">Montant CDF</th>
                  <th className="py-3 px-3 text-center">Statut</th>
                  <th className="py-3 px-3">Réf. Transaction</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredPayouts.map((payout) => {
                  const isPending = payout.status === "pending" || payout.status === "processing"
                  const isPaid = payout.status === "paid" || payout.status === "processed"

                  const badgeStyles: Record<string, string> = {
                    paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                    processed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
                    processing: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
                    rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
                  }

                  const badgeLabels: Record<string, string> = {
                    paid: "✓ Payé / Viré",
                    processed: "✓ Payé / Viré",
                    pending: "⏳ En attente",
                    processing: "🔄 En cours",
                    rejected: "✕ Rejeté",
                  }

                  const operatorBadge = {
                    "M-Pesa": "text-red-600 bg-red-50 dark:bg-red-950/40",
                    "Orange Money": "text-orange-600 bg-orange-50 dark:bg-orange-950/40",
                    "Airtel Money": "text-rose-600 bg-rose-50 dark:bg-rose-950/40",
                  }[payout.method]

                  return (
                    <tr key={payout.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-3.5 px-3 font-medium text-zinc-500 whitespace-nowrap">
                        {format(new Date(payout.requestedAt), "dd/MM/yyyy HH:mm")}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-zinc-900 dark:text-white">
                          {payout.providerName}
                        </div>
                        {payout.notes && (
                          <div className="text-[10px] text-zinc-400 italic">{payout.notes}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${operatorBadge}`}>
                          {payout.method}
                        </span>
                        <div className="text-[11px] font-mono font-bold mt-0.5 text-zinc-700 dark:text-zinc-300">
                          {payout.phoneNumber}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-black text-sm whitespace-nowrap">
                        {formatPrice(payout.amountUSD)}
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {formatPriceFC(payout.amountUSD)}
                      </td>

                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeStyles[payout.status] || ""}`}>
                          {badgeLabels[payout.status] || payout.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {payout.transactionRef ? (
                          <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md dark:bg-emerald-950/40 dark:text-emerald-300">
                            {payout.transactionRef}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic">Non renseigné</span>
                        )}
                        {payout.adminNotes && (
                          <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                            Motif : {payout.adminNotes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleStartValidation(payout.id, payout.method)}
                              className="h-7 gap-1 bg-emerald-600 hover:bg-emerald-700 text-[11px] text-white px-2.5"
                            >
                              <Check className="h-3 w-3" /> Valider virement
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartReject(payout.id)}
                              className="h-7 text-[11px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 px-2"
                            >
                              <X className="h-3 w-3" /> Rejeter
                            </Button>
                          </div>
                        ) : isPaid ? (
                          <span className="text-[11px] text-emerald-600 font-bold">
                            ✓ Traité le {payout.processedAt ? format(new Date(payout.processedAt), "dd/MM") : ""}
                          </span>
                        ) : (
                          <span className="text-[11px] text-red-500 font-semibold">Rejeté</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Validation Virement Mobile Money */}
      {validatingPayoutId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Confirmer le Virement Mobile Money</h3>
                <p className="text-xs text-zinc-500">Saisie du code de transaction officiel</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Vous confirmez avoir effectué le virement des fonds vers le numéro Mobile Money du prestataire. Renseignez la référence de la transaction :
              </p>

              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Référence Mobile Money (ex: SMS de confirmation M-Pesa / Orange)
                </label>
                <input
                  type="text"
                  required
                  value={transactionRefInput}
                  onChange={(e) => setTransactionRefInput(e.target.value)}
                  placeholder="MPESA-123456-RDC"
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs font-mono font-bold focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setValidatingPayoutId(null)}
                  className="flex-1 text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() => handleConfirmValidation(validatingPayoutId)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  Confirmer le paiement
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rejet Retrait */}
      {rejectingPayoutId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Rejeter la demande de retrait</h3>
                <p className="text-xs text-zinc-500">Indiquez la raison du rejet au prestataire</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Motif du rejet
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="Ex : Numéro non enregistré au nom du titulaire..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs focus:border-red-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectingPayoutId(null)}
                  className="flex-1 text-xs"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  onClick={() => handleConfirmReject(rejectingPayoutId)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                >
                  Confirmer le rejet
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
