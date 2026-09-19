"use client"

import { useMemo, useState } from "react"
import { useProviderSpace } from "@/lib/provider-context"
import { useBookings } from "@/lib/booking-context"
import { formatPrice, formatPriceFC } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Smartphone,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Send,
  AlertCircle,
  Check,
} from "lucide-react"
import { format, subMonths } from "date-fns"
import { fr } from "date-fns/locale"

const MONTHS_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
]

export default function ProviderReportsPage() {
  const { session, payoutRequests, requestPayout, accounts } = useProviderSpace()
  const { bookings } = useBookings()

  const currentAccount = useMemo(
    () => accounts.find((a) => a.name === session),
    [accounts, session]
  )

  const myBookings = useMemo(
    () => bookings.filter((b) => b.providerName === session),
    [bookings, session]
  )

  const confirmedOrDone = useMemo(
    () => myBookings.filter((b) => b.status === "confirmed" || b.status === "completed"),
    [myBookings]
  )
  const pending = myBookings.filter((b) => b.status === "pending")
  const cancelled = myBookings.filter((b) => b.status === "cancelled")

  const totalVolume = confirmedOrDone.reduce((sum, b) => sum + b.price, 0)
  const totalDeposits = confirmedOrDone.reduce((sum, b) => sum + b.deposit, 0)

  // Retraits Mobile Money liés à ce prestataire
  const myPayouts = useMemo(
    () => (payoutRequests || []).filter((p) => p.providerName === session),
    [payoutRequests, session]
  )

  const totalPaidOut = myPayouts
    .filter((p) => p.status === "paid" || p.status === "processed")
    .reduce((sum, p) => sum + p.amountUSD, 0)

  const totalPendingPayout = myPayouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amountUSD, 0)

  // Solde disponible pour nouveau retrait
  const availableForWithdrawal = Math.max(0, totalDeposits - totalPaidOut - totalPendingPayout)

  // Modal Demande de Retrait
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState<number | "">(50)
  const [payoutMethod, setPayoutMethod] = useState<"M-Pesa" | "Orange Money" | "Airtel Money">("M-Pesa")
  const [payoutPhone, setPayoutPhone] = useState(currentAccount?.phone || "+243 81 234 5678")
  const [payoutNotes, setPayoutNotes] = useState("")
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState("")
  const [payoutError, setPayoutError] = useState("")

  const handleOpenPayoutModal = () => {
    setPayoutError("")
    setPayoutSuccessMsg("")
    setPayoutPhone(currentAccount?.phone || "+243 81 234 5678")
    setPayoutAmount(Math.min(availableForWithdrawal > 10 ? 50 : availableForWithdrawal, availableForWithdrawal || 50))
    setIsPayoutModalOpen(true)
  }

  const handleRequestPayoutSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPayoutError("")

    const numAmount = Number(payoutAmount)
    if (!numAmount || numAmount < 10) {
      setPayoutError("Le montant minimum de retrait Mobile Money est de 10 $ USD.")
      return
    }

    if (numAmount > availableForWithdrawal && availableForWithdrawal > 0) {
      setPayoutError(`Le montant dépasse votre solde disponible (${formatPrice(availableForWithdrawal)}).`)
      return
    }

    if (!payoutPhone.trim() || payoutPhone.length < 8) {
      setPayoutError("Veuillez renseigner un numéro de téléphone valide pour le transfert.")
      return
    }

    if (!session) return

    requestPayout({
      providerName: session,
      amountUSD: numAmount,
      method: payoutMethod,
      phoneNumber: payoutPhone,
      notes: payoutNotes || "Retrait acomptes réservations",
    })

    setPayoutSuccessMsg("Votre demande de virement Mobile Money a été transmise à la direction financière !")
    setTimeout(() => {
      setIsPayoutModalOpen(false)
      setPayoutSuccessMsg("")
      setPayoutNotes("")
    }, 1800)
  }

  // Taux de conversion
  const conversionRate =
    myBookings.length > 0
      ? Math.round((confirmedOrDone.length / myBookings.length) * 100)
      : 0

  // Panier moyen
  const averageBooking =
    confirmedOrDone.length > 0 ? Math.round(totalVolume / confirmedOrDone.length) : 0

  // Répartition par méthode Mobile Money
  const paymentsByMethod = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {
      "M-Pesa": { count: 0, total: 0 },
      "Orange Money": { count: 0, total: 0 },
      "Airtel Money": { count: 0, total: 0 },
    }
    for (const b of confirmedOrDone) {
      const m = b.paymentMethod || "M-Pesa"
      if (!map[m]) map[m] = { count: 0, total: 0 }
      map[m].count += 1
      map[m].total += b.deposit
    }
    return map
  }, [confirmedOrDone])

  // Historique 6 derniers mois
  const monthlyStats = useMemo(() => {
    const list = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i)
      const inMonth = confirmedOrDone.filter((b) => {
        const d = new Date(b.date)
        return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear()
      })
      const volume = inMonth.reduce((sum, b) => sum + b.price, 0)
      const deposits = inMonth.reduce((sum, b) => sum + b.deposit, 0)
      list.push({
        label: `${MONTHS_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
        count: inMonth.length,
        volume,
        deposits,
      })
    }
    return list
  }, [confirmedOrDone])

  const maxVolume = Math.max(...monthlyStats.map((m) => m.volume), 1)

  const handlePrint = () => {
    window.print()
  }

  if (!session) return null

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <BarChart3 className="h-3.5 w-3.5" /> Bilan Financier & Trésorerie
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Rapports & Retraits Mobile Money</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Établissement : <strong>{session}</strong> • Date : {format(new Date(), "d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleOpenPayoutModal}
            className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md"
          >
            <ArrowDownLeft className="h-4 w-4" /> Demander un retrait Mobile Money
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2 text-xs">
            <Printer className="h-4 w-4" /> Imprimer le rapport
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Chiffre d&apos;affaires</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl font-extrabold">{formatPrice(totalVolume)}</div>
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-0.5">
            ≈ {formatPriceFC(totalVolume)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">{confirmedOrDone.length} prestations honorées</div>
        </div>

        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Acomptes Encaissés (50%)</span>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatPrice(totalDeposits)}
          </div>
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">
            ≈ {formatPriceFC(totalDeposits)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">M-Pesa / Orange / Airtel Money</div>
        </div>

        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/40 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-bold">
            <span>Disponible au retrait</span>
            <Smartphone className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700 dark:text-emerald-300">
            {formatPrice(availableForWithdrawal)}
          </div>
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mt-0.5">
            ≈ {formatPriceFC(availableForWithdrawal)}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Prêt à virer</span>
            <button
              onClick={handleOpenPayoutModal}
              className="text-[11px] font-bold text-emerald-700 underline hover:text-emerald-800 dark:text-emerald-300"
            >
              Retirer →
            </button>
          </div>
        </div>

        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Panier moyen / client</span>
            <ArrowUpRight className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-3 text-2xl font-extrabold">{formatPrice(averageBooking)}</div>
          <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 mt-0.5">
            Taux confirmation : {conversionRate}%
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">{myBookings.length} demandes au total</div>
        </div>
      </div>

      {/* Section Portefeuille & Retraits Mobile Money */}
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                📱
              </span>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                  Portefeuille & Retraits Mobile Money (RDC)
                </h3>
                <p className="text-xs text-zinc-500">
                  Transférez vos acomptes clients perçus directement sur votre compte Vodacom M-Pesa, Orange Money ou Airtel Money.
                </p>
              </div>
            </div>
          </div>

          <Button
            size="sm"
            onClick={handleOpenPayoutModal}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            <Plus className="h-4 w-4" /> Nouvelle demande de retrait
          </Button>
        </div>

        {/* Bilan Synthétique Retraits */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
            <span className="text-[11px] font-medium text-zinc-500">Déjà versé sur Mobile Money</span>
            <div className="text-xl font-black text-zinc-900 dark:text-white mt-1">
              {formatPrice(totalPaidOut)}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              ≈ {formatPriceFC(totalPaidOut)}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/30">
            <span className="text-[11px] font-medium text-zinc-500">En cours de traitement</span>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {formatPrice(totalPendingPayout)}
            </div>
            <div className="text-[11px] font-semibold text-zinc-400 mt-0.5">
              ≈ {formatPriceFC(totalPendingPayout)}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              Disponible au transfert immédiat
            </span>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
              {formatPrice(availableForWithdrawal)}
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              ≈ {formatPriceFC(availableForWithdrawal)}
            </div>
          </div>
        </div>

        {/* Historique des demandes de retrait */}
        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-400 mb-3">
            Historique des ordres de transfert Mobile Money
          </h4>

          {myPayouts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center text-xs text-zinc-500 dark:border-zinc-800">
              <Smartphone className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
              Vous n&apos;avez encore soumis aucune demande de retrait Mobile Money.
              <br />
              Dès qu&apos;un client verse un acompte pour une cérémonie, vous pouvez demander le virement ici.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50 font-bold text-zinc-600 dark:text-zinc-300">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Opérateur & Numéro</th>
                    <th className="py-2.5 px-3 text-right">Montant USD</th>
                    <th className="py-2.5 px-3 text-right">Équivalent FC</th>
                    <th className="py-2.5 px-3 text-center">Statut</th>
                    <th className="py-2.5 px-3">Réf. Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {myPayouts.map((payout) => {
                    const badgeStyles: Record<string, string> = {
                      paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                      processed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
                      pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
                      processing: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
                      rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
                    }

                    const badgeLabels: Record<string, string> = {
                      paid: "✓ Transféré",
                      processed: "✓ Transféré",
                      pending: "⏳ En attente",
                      processing: "🔄 En traitement",
                      rejected: "✕ Rejeté",
                    }

                    const operatorLogo = {
                      "M-Pesa": "🔴 Vodacom M-Pesa",
                      "Orange Money": "🟠 Orange Money",
                      "Airtel Money": "🔴 Airtel Money",
                    }[payout.method]

                    return (
                      <tr key={payout.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                        <td className="py-3 px-3 font-medium text-zinc-500 whitespace-nowrap">
                          {format(new Date(payout.requestedAt), "dd/MM/yyyy HH:mm")}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold">{operatorLogo}</div>
                          <div className="text-[11px] text-zinc-500 font-mono">{payout.phoneNumber}</div>
                          {payout.notes && (
                            <div className="text-[10px] text-zinc-400 italic mt-0.5">{payout.notes}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-sm">
                          {formatPrice(payout.amountUSD)}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                          {formatPriceFC(payout.amountUSD)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeStyles[payout.status] || ""}`}>
                            {badgeLabels[payout.status] || payout.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {payout.transactionRef ? (
                            <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md dark:bg-emerald-950/40 dark:text-emerald-300">
                              {payout.transactionRef}
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-400">En cours d&apos;attribution</span>
                          )}
                          {payout.adminNotes && (
                            <div className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                              Note : {payout.adminNotes}
                            </div>
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
      </div>

      {/* Graphique d'évolution */}
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-base">Évolution du volume d&apos;affaires sur 6 mois</h3>
            <p className="text-xs text-zinc-500">Montants bruts en USD générés par vos prestations de cérémonie</p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Hors annulations
          </span>
        </div>

        <div className="flex h-52 items-end gap-4 pt-6 pb-2">
          {monthlyStats.map((m, idx) => {
            const pct = Math.max((m.volume / maxVolume) * 100, 4)
            return (
              <div key={idx} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                  {m.volume > 0 ? formatPrice(m.volume) : "0$"}
                </div>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-2xl bg-gradient-to-t from-amber-500 to-red-400 transition-all hover:opacity-90"
                    style={{ height: `${pct}%` }}
                    title={`${m.label} : ${formatPrice(m.volume)} (${m.count} réservations)`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-zinc-500 truncate max-w-full">
                  {m.label.split(" ")[0]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tableau détaillé & Répartition Mobile Money */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Tableau mensuel */}
        <div className="rounded-[28px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <h3 className="font-bold text-base mb-4">Tableau d&apos;activité mensuelle</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50 font-bold text-zinc-600 dark:text-zinc-300">
                  <th className="py-2.5 px-3">Mois</th>
                  <th className="py-2.5 px-3 text-center">Réservations</th>
                  <th className="py-2.5 px-3 text-right">Acomptes (50%)</th>
                  <th className="py-2.5 px-3 text-right">Volume Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {monthlyStats.map((row, i) => (
                  <tr key={i}>
                    <td className="py-3 px-3 font-semibold">{row.label}</td>
                    <td className="py-3 px-3 text-center">{row.count}</td>
                    <td className="py-3 px-3 text-right text-emerald-600 font-bold">
                      {formatPrice(row.deposits)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold">{formatPrice(row.volume)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Répartition Mobile Money & Synthèse statuts */}
        <div className="space-y-6">
          <div className="rounded-[28px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
            <h3 className="font-bold text-base mb-3 flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-emerald-600" /> Acomptes clients reçus
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              Répartition des acomptes reçus par opérateur en République Démocratique du Congo :
            </p>

            <div className="space-y-3">
              {Object.entries(paymentsByMethod).map(([method, data]) => {
                const pct = totalDeposits > 0 ? Math.round((data.total / totalDeposits) * 100) : 0
                return (
                  <div key={method} className="rounded-2xl border border-zinc-100 p-3 dark:border-zinc-800">
                    <div className="flex justify-between text-xs font-bold">
                      <span>{method}</span>
                      <span className="text-emerald-600">{formatPrice(data.total)} ({pct}%)</span>
                    </div>
                    <div className="mt-1 text-[10px] text-zinc-400">
                      {data.count} transaction{data.count > 1 ? "s" : ""}
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-3 text-xs">
            <div className="font-bold text-sm">État du carnet de réservations :</div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Confirmées / Réalisées
              </span>
              <span className="font-bold">{confirmedOrDone.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <Clock className="h-3.5 w-3.5 text-amber-500" /> Demandes en attente
              </span>
              <span className="font-bold text-amber-600">{pending.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-zinc-500">
                <XCircle className="h-3.5 w-3.5 text-red-500" /> Annulées
              </span>
              <span className="font-bold text-red-600">{cancelled.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Demande de Retrait Mobile Money */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[32px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                    Demande de Retrait Mobile Money
                  </h3>
                  <p className="text-xs text-zinc-500">République Démocratique du Congo (RDC)</p>
                </div>
              </div>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                ✕
              </button>
            </div>

            {payoutSuccessMsg ? (
              <div className="my-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
                  <Check className="h-7 w-7" />
                </div>
                <h4 className="font-bold text-base text-emerald-700 dark:text-emerald-400">Demande Enregistrée !</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 max-w-xs mx-auto">
                  {payoutSuccessMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayoutSubmit} className="mt-4 space-y-4">
                <div className="rounded-2xl bg-emerald-50 p-3.5 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 flex justify-between items-center">
                  <span>Solde disponible pour retrait :</span>
                  <span className="font-black text-sm">{formatPrice(availableForWithdrawal)}</span>
                </div>

                {payoutError && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 font-semibold flex items-center gap-2 dark:bg-red-950/40 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{payoutError}</span>
                  </div>
                )}

                {/* Opérateur */}
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Choisir votre opérateur Mobile Money RDC
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "M-Pesa", label: "M-Pesa", desc: "Vodacom", color: "border-red-500 text-red-600" },
                      { id: "Orange Money", label: "Orange", desc: "Orange", color: "border-orange-500 text-orange-600" },
                      { id: "Airtel Money", label: "Airtel", desc: "Airtel", color: "border-rose-500 text-rose-600" },
                    ].map((op) => (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() =>
                          setPayoutMethod(op.id as "M-Pesa" | "Orange Money" | "Airtel Money")
                        }
                        className={`rounded-2xl border p-3 text-center transition-all ${
                          payoutMethod === op.id
                            ? "border-emerald-500 bg-emerald-50/50 shadow-sm dark:bg-emerald-950/40 ring-1 ring-emerald-500"
                            : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800"
                        }`}
                      >
                        <div className="font-black text-xs">{op.label}</div>
                        <div className="text-[10px] text-zinc-400">{op.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Numéro de téléphone */}
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Numéro de téléphone de réception ({payoutMethod})
                  </label>
                  <input
                    type="tel"
                    required
                    value={payoutPhone}
                    onChange={(e) => setPayoutPhone(e.target.value)}
                    placeholder="+243 81 000 0000"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs font-mono font-bold focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <span className="text-[10px] text-zinc-400">Assurez-vous que le compte Mobile Money est actif et identifié à votre nom.</span>
                </div>

                {/* Montant USD */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      Montant du retrait (USD $)
                    </label>
                    <span className="text-[11px] font-semibold text-emerald-600">
                      ≈ {payoutAmount ? formatPriceFC(Number(payoutAmount)) : "0 FC"}
                    </span>
                  </div>
                  <input
                    type="number"
                    min="10"
                    step="5"
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value ? Number(e.target.value) : "")}
                    placeholder="Montant en USD (ex: 50)"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-sm font-black focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  />

                  {/* Boutons d'accès rapide */}
                  <div className="mt-2 flex gap-2">
                    {[25, 50, 100, 200].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPayoutAmount(Math.min(val, availableForWithdrawal || val))}
                        className="rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-1 text-[11px] font-bold text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      >
                        {val} $
                      </button>
                    ))}
                    {availableForWithdrawal > 0 && (
                      <button
                        type="button"
                        onClick={() => setPayoutAmount(availableForWithdrawal)}
                        className="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                      >
                        Tout retirer ({formatPrice(availableForWithdrawal)})
                      </button>
                    )}
                  </div>
                </div>

                {/* Motif / Commentaire */}
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Motif / Commentaire (optionnel)
                  </label>
                  <input
                    type="text"
                    value={payoutNotes}
                    onChange={(e) => setPayoutNotes(e.target.value)}
                    placeholder="Ex: Acompte mariage Kabila & achat fleurs"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                {/* Bouton de soumission */}
                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPayoutModalOpen(false)}
                    className="flex-1 text-xs"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    <Send className="h-4 w-4" /> Envoyer la demande
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

