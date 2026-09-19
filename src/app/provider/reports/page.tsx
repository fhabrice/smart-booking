"use client"

import { useMemo } from "react"
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
  const { session } = useProviderSpace()
  const { bookings } = useBookings()

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
  const totalBalances = totalVolume - totalDeposits

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
            <BarChart3 className="h-3.5 w-3.5" /> États & Bilan d&apos;activité
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Rapports & Statistiques Financières</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Établissement : <strong>{session}</strong> • Date : {format(new Date(), "d MMMM yyyy", { locale: fr })}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2 text-xs">
            <Printer className="h-4 w-4" /> Imprimer le rapport d&apos;activité
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
            <span>Acomptes Mobile Money</span>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-3 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatPrice(totalDeposits)}
          </div>
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5">
            ≈ {formatPriceFC(totalDeposits)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">Encaissés via M-Pesa/Orange/Airtel</div>
        </div>

        <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-medium">
            <span>Solde à encaisser</span>
            <Clock className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-3 text-2xl font-extrabold">{formatPrice(totalBalances)}</div>
          <div className="text-xs font-semibold text-zinc-500 mt-0.5">
            ≈ {formatPriceFC(totalBalances)}
          </div>
          <div className="mt-2 text-[11px] text-zinc-400">Perçu sur place le jour de l&apos;événement</div>
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
              <Smartphone className="h-4 w-4 text-emerald-600" /> Encaissements Mobile Money
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
    </div>
  )
}
