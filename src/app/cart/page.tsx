"use client"

import { useState } from "react"
import Link from "next/link"
import { useCart } from "@/lib/cart-context"
import { useProviderSpace } from "@/lib/provider-context"
import type { QuoteData } from "@/lib/types"
import { resolvePaymentDestination } from "@/lib/commission"
import { formatPrice, formatPriceFC } from "@/lib/utils"
import { categoryName, paymentMethods } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  ShoppingBag,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  FileText,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Share2,
  X,
  User,
  Phone,
  Tag,
  Receipt,
} from "lucide-react"
import { format, addDays } from "date-fns"
import { fr } from "date-fns/locale"
import { BOOKING_HORIZON_MONTHS, clampToBookableRange, isoDay, maxBookableDate, minBookableDate } from "@/lib/utils"

export default function CartPage() {
  const {
    items,
    itemCount,
    removeItem,
    clearCart,
    updateItem,
    subtotalUSD,
    discountUSD,
    totalUSD,
    depositUSD,
    balanceUSD,
    generateQuote,
    checkoutCart,
  } = useCart()
  const { accounts } = useProviderSpace()

  // Compte de réception de chaque prestataire (fourni lors de son inscription) :
  // l'acompte de chaque prestation est versé directement dessus.
  const payoutFor = (providerName: string) =>
    resolvePaymentDestination(
      accounts.find((a) => a.name.toLowerCase() === providerName.toLowerCase())
    )

  // Checkout modal
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("M-Pesa")
  const [ceremonyTitle, setCeremonyTitle] = useState("")
  const [city] = useState("Kinshasa")
  const [isSuccess, setIsSuccess] = useState(false)

  // Document modals
  const [quoteModal, setQuoteModal] = useState<QuoteData | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [actionError, setActionError] = useState("")
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceNumber] = useState("FACT-2026-4821")

  // Quick sync all items to a single date
  const [syncDate, setSyncDate] = useState(format(addDays(new Date(), 14), "yyyy-MM-dd"))
  const [syncTime, setSyncTime] = useState("10:00")

  // Fenêtre de réservation commune à tout le panier : aujourd'hui → +24 mois
  const dateMin = isoDay(minBookableDate())
  const dateMax = isoDay(maxBookableDate())

  const handleApplySync = () => {
    items.forEach((item) => {
      updateItem(item.id, { date: syncDate, time: syncTime })
    })
  }

  const handleOpenQuote = async () => {
    setQuoteLoading(true)
    setActionError("")
    try {
      const q = await generateQuote({
        name: customerName || "Client Organisateur",
        phone: customerPhone || "+243 8xx xxx xxx",
        ceremonyType: ceremonyTitle || "Cérémonie & Fête",
        city: city || "Kinshasa",
      })
      setQuoteModal(q)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Impossible d'enregistrer le devis.")
    } finally {
      setQuoteLoading(false)
    }
  }

  const handleConfirmOrder = async () => {
    if (!customerName || customerPhone.length < 8) return
    setOrderLoading(true)
    setActionError("")
    try {
      await checkoutCart({
        name: customerName,
        phone: customerPhone,
        paymentMethod,
        ceremonyTitle,
      })
      setIsSuccess(true)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "La commande a échoué. Réessayez.")
    } finally {
      setOrderLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleShareWhatsApp = () => {
    const text = `🇨🇩 *Devis Smart Booking RDC*\n` +
      `Cérémonie : ${ceremonyTitle || "Événement"}\n` +
      `Services réservés (${itemCount}) : ` +
      items.map((i) => `\n- ${i.service.name} (${formatPrice(i.service.price)})`).join("") +
      `\n\n*Total* : ${formatPrice(totalUSD)} (≈ ${formatPriceFC(totalUSD)})\n` +
      `*Acompte 50% Mobile Money* : ${formatPrice(depositUSD)}\n` +
      `*Solde le jour J* : ${formatPrice(balanceUSD)}\n` +
      `Réf. Smart Booking RDC`

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#fcfcf9] p-4 dark:bg-zinc-950">
        <div className="max-w-md w-full rounded-[32px] border border-emerald-200 bg-white p-8 text-center shadow-xl dark:border-emerald-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight">Réservation confirmée ! 🎉</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Votre pack cérémonie de <strong>{itemCount || "plusieurs"} prestations</strong> a été envoyé aux prestataires. Vous recevrez une confirmation et le numéro de paiement de chaque prestataire pour verser directement les acomptes ({paymentMethod}).
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/bookings">
              <Button className="w-full bg-gradient-to-r from-amber-500 to-red-500">
                Consulter mes réservations
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Titre */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <ShoppingBag className="h-3.5 w-3.5" /> Panier Multi-Prestations & Devis
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Mon Panier & Devis Cérémonie</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Composez le pack complet de votre événement (salle, traiteur, sono, photo, déco) et éditez votre devis officiel.
            </p>
          </div>

          {itemCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => void handleOpenQuote()} className="gap-2">
                <FileText className="h-4 w-4 text-amber-600" /> Générer le Devis Pro-forma
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowInvoice(true)} className="gap-2">
                <Receipt className="h-4 w-4 text-emerald-600" /> Facture d&apos;acompte
              </Button>
              <Button variant="ghost" size="sm" onClick={clearCart} className="text-red-600 hover:bg-red-50 text-xs">
                Vider le panier
              </Button>
            </div>
          )}
        </div>

        {itemCount === 0 ? (
          <div className="mt-12 rounded-[32px] border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10">
              <ShoppingBag className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Votre panier de cérémonie est vide</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Sélectionnez les services dont vous avez besoin pour votre mariage, dot ou fête (salle, traiteur, photographe, décoration, sonorisation) pour obtenir un devis global chiffré.
            </p>
            <div className="mt-6">
              <Link href="/">
                <Button className="gap-2 bg-gradient-to-r from-amber-500 to-red-500">
                  <Sparkles className="h-4 w-4" /> Parcourir les prestataires
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.8fr_1fr]">
            {/* Colonne gauche : liste des prestations */}
            <div className="space-y-6">
              {/* Synchroniseur de date pour toute la cérémonie */}
              <div className="rounded-[24px] border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-600" />
                    <div>
                      <h4 className="text-sm font-bold">Même date pour toute la cérémonie ?</h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Appliquez en un clic la date et l&apos;heure à l&apos;ensemble de vos prestations — réservation
                        possible sur {BOOKING_HORIZON_MONTHS} mois, jusqu&apos;au{" "}
                        {format(maxBookableDate(), "d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={syncDate}
                      min={dateMin}
                      max={dateMax}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value) setSyncDate(clampToBookableRange(value))
                      }}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900 dark:[color-scheme:dark]"
                    />
                    <input
                      type="time"
                      value={syncTime}
                      onChange={(e) => setSyncTime(e.target.value)}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <Button size="sm" onClick={handleApplySync} className="text-xs bg-amber-600 hover:bg-amber-700">
                      Appliquer à tous
                    </Button>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-4 rounded-[24px] border border-zinc-200 bg-white p-5 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center"
                  >
                    <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-28">
                      <img src={item.service.image} alt={item.service.name} className="h-full w-full object-cover" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                            {categoryName(item.service.category)}
                          </span>
                          <h3 className="mt-1 truncate text-base font-bold">{item.service.name}</h3>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                            <span>{item.service.provider.name}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <MapPin className="h-3 w-3" /> {item.service.city}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold">{formatPrice(item.service.price)}</div>
                          <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                            ≈ {formatPriceFC(item.service.price)}
                          </div>
                          <div className="text-[10px] text-zinc-400">{item.service.priceUnit}</div>
                        </div>
                      </div>

                      {/* Date & heure par prestation */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                            <input
                              type="date"
                              value={item.date}
                              min={dateMin}
                              max={dateMax}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value) updateItem(item.id, { date: clampToBookableRange(value) })
                              }}
                              className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:[color-scheme:dark]"
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-zinc-400" />
                            <input
                              type="time"
                              value={item.time}
                              onChange={(e) => updateItem(item.id, { time: e.target.value })}
                              className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colonne droite : Synthèse financière & actions */}
            <div className="space-y-6">
              <div className="rounded-[28px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
                <h3 className="text-lg font-bold">Récapitulatif Financier</h3>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Prestations sélectionnées ({itemCount})</span>
                    <span className="font-semibold">{formatPrice(subtotalUSD)}</span>
                  </div>

                  {discountUSD > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" /> Remise Pack Cérémonie (-5%)
                      </span>
                      <span className="font-bold">-{formatPrice(discountUSD)}</span>
                    </div>
                  )}

                  <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

                  <div className="flex justify-between text-base font-bold">
                    <span>Total Devis</span>
                    <div className="text-right">
                      <div>{formatPrice(totalUSD)}</div>
                      <div className="text-xs font-normal text-amber-700 dark:text-amber-400">
                        ≈ {formatPriceFC(totalUSD)}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/60 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Acompte exigible (50%)</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatPrice(depositUSD)} · {formatPriceFC(depositUSD)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Solde sur place le jour J</span>
                      <span className="font-medium">
                        {formatPrice(balanceUSD)} · {formatPriceFC(balanceUSD)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="mt-6 space-y-2">
                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full gap-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-sm font-semibold"
                    size="lg"
                  >
                    <ShieldCheck className="h-4 w-4" /> Valider la réservation du pack
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => void handleOpenQuote()}
                    disabled={quoteLoading}
                    className="w-full gap-2 text-xs font-semibold disabled:opacity-60"
                  >
                    <FileText className="h-4 w-4 text-amber-600" />
                    {quoteLoading ? "Enregistrement du devis…" : "Afficher & Imprimer le Devis"}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleShareWhatsApp}
                    className="w-full gap-2 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                  >
                    <Share2 className="h-4 w-4" /> Partager l&apos;estimation sur WhatsApp
                  </Button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Smartphone className="h-3 w-3" /> M-Pesa · Orange · Airtel
                  </span>
                  <span>•</span>
                  <span>Devis certifié Smart Booking</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL CHECKOUT VALIDATION */}
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-w-lg w-full rounded-[32px] border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              <button
                onClick={() => setShowCheckout(false)}
                className="absolute right-5 top-5 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Confirmation de la commande</h3>
                  <p className="text-xs text-zinc-500">Pack de {itemCount} prestations de cérémonie</p>
                </div>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Titre ou Nom de la Cérémonie
                  </label>
                  <input
                    value={ceremonyTitle}
                    onChange={(e) => setCeremonyTitle(e.target.value)}
                    placeholder="Ex : Mariage de Felly & Gracia, Dotation à Gombe…"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Nom complet de l&apos;organisateur *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ex : Patrick Kabeya"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                      Numéro Téléphone / WhatsApp *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                      <input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+243 8xx xxx xxx"
                        type="tel"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-9 pr-3 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Mode de paiement */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                    Mode de règlement de l&apos;acompte (Mobile Money RDC)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.name)}
                        className={`rounded-xl border p-2 text-center text-xs font-bold transition-all ${
                          paymentMethod === pm.name
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                            : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
                        }`}
                      >
                        {pm.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Synthèse acompte */}
                <div className="rounded-2xl bg-amber-50 p-4 text-xs dark:bg-amber-950/30">
                  <div className="flex justify-between font-bold">
                    <span>Acompte à régler ({paymentMethod}) :</span>
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {formatPrice(depositUSD)} (≈ {formatPriceFC(depositUSD)})
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                    Chaque acompte est versé directement sur le numéro de paiement du prestataire concerné. Le solde restant ({formatPrice(balanceUSD)}) sera réglé sur place le jour de la cérémonie.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCheckout(false)}
                  className="w-1/3"
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => void handleConfirmOrder()}
                  disabled={!customerName || customerPhone.length < 8 || orderLoading}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 disabled:opacity-60"
                >
                  {orderLoading ? "Enregistrement…" : "Confirmer et Réserver"}
                </Button>
              </div>
              {actionError && (
                <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  {actionError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* MODAL DEVIS PRO-FORMA IMPRIMABLE */}
        {quoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in">
            <div className="relative max-w-3xl w-full rounded-[28px] bg-white p-6 sm:p-10 text-zinc-900 shadow-2xl dark:bg-zinc-900 dark:text-zinc-100 my-8">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-5 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-white font-bold">
                    ✦
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">SMART BOOKING RDC</h2>
                    <p className="text-xs text-zinc-500">Plateforme officielle de réservation de cérémonie 🇨🇩</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handlePrint} className="gap-1.5 text-xs bg-zinc-900 text-white dark:bg-white dark:text-black">
                    <Printer className="h-3.5 w-3.5" /> Imprimer / PDF
                  </Button>
                  <button
                    onClick={() => setQuoteModal(null)}
                    className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Contenu Devis */}
              <div className="mt-6 space-y-6">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      DEVIS ESTIMATIF PRO-FORMA
                    </span>
                    <div className="mt-2 text-2xl font-extrabold tracking-tight font-mono">{quoteModal.quoteNumber}</div>
                    <div className="text-xs text-zinc-500">Date d&apos;émission : {quoteModal.date}</div>
                    <div className="text-xs text-zinc-500">Validité : 30 jours (jusqu&apos;au {quoteModal.validUntil})</div>
                  </div>
                  <div className="text-right text-xs space-y-0.5">
                    <div className="font-bold text-sm">Client Destinataire :</div>
                    <div className="font-semibold text-zinc-700 dark:text-zinc-300">{quoteModal.customerName}</div>
                    <div className="text-zinc-500">{quoteModal.customerPhone}</div>
                    <div className="text-zinc-500">Ville : {quoteModal.city}</div>
                    <div className="text-zinc-500">Cérémonie : {quoteModal.ceremonyType}</div>
                  </div>
                </div>

                {/* Tableau */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60 font-semibold text-zinc-600 dark:text-zinc-300">
                        <th className="py-2.5 px-3">Prestation</th>
                        <th className="py-2.5 px-3">Prestataire & Lieu</th>
                        <th className="py-2.5 px-3">Date Prévue</th>
                        <th className="py-2.5 px-3 text-right">Montant USD</th>
                        <th className="py-2.5 px-3 text-right">Équiv. FC</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {quoteModal.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3 px-3 font-semibold">{item.service.name}</td>
                          <td className="py-3 px-3 text-zinc-500">
                            {item.service.provider.name} ({item.service.city})
                          </td>
                          <td className="py-3 px-3 text-zinc-500">
                            {item.date} à {item.time}
                          </td>
                          <td className="py-3 px-3 text-right font-bold">{formatPrice(item.service.price)}</td>
                          <td className="py-3 px-3 text-right text-zinc-500">{formatPriceFC(item.service.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totaux */}
                <div className="flex justify-end">
                  <div className="w-72 space-y-2 text-xs border-t border-zinc-200 pt-3 dark:border-zinc-700">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Sous-total :</span>
                      <span className="font-semibold">{formatPrice(quoteModal.subtotal)}</span>
                    </div>
                    {quoteModal.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Remise Pack (-5%) :</span>
                        <span>-{formatPrice(quoteModal.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold border-t border-zinc-200 pt-2 dark:border-zinc-700">
                      <span>Total Devis :</span>
                      <span>{formatPrice(quoteModal.total)} ({formatPriceFC(quoteModal.total)})</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span>Acompte Mobile Money (50%) :</span>
                      <span>{formatPrice(quoteModal.deposit)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Solde sur place le jour J :</span>
                      <span>{formatPrice(quoteModal.balance)}</span>
                    </div>
                  </div>
                </div>

                {/* Sceau & Mentions */}
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-500">
                  <div>
                    <div className="font-bold text-zinc-700 dark:text-zinc-300">Conditions de règlement :</div>
                    <div>Acompte de 50% via M-Pesa, Orange Money ou Airtel Money dès validation.</div>
                    <div>Annulation sans frais jusqu&apos;à 72h avant l&apos;événement. Taux indicatif 1 USD ≈ 2 850 FC.</div>
                  </div>
                  <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-center text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
                    <div className="text-[10px] font-bold uppercase tracking-wider">CERTIFIÉ CONFORME</div>
                    <div className="text-xs font-black">✦ SMART BOOKING RDC ✦</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL FACTURE D'ACOMPTE */}
        {showInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto animate-in fade-in">
            <div className="relative max-w-2xl w-full rounded-[28px] bg-white p-6 sm:p-8 text-zinc-900 shadow-2xl dark:bg-zinc-900 dark:text-zinc-100 my-8">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-bold text-lg">Facture Proforma d&apos;acompte</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handlePrint} className="gap-1 text-xs">
                    <Printer className="h-3.5 w-3.5" /> Imprimer
                  </Button>
                  <button onClick={() => setShowInvoice(false)} className="rounded-full p-1 text-zinc-400">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-4 text-xs">
                <div className="flex justify-between">
                  <div>
                    <div className="font-mono text-sm font-bold">{invoiceNumber}</div>
                    <div className="text-zinc-500">Émise le {format(new Date(), "d MMMM yyyy", { locale: fr })}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">Smart Booking RDC SARL</div>
                    <div className="text-zinc-500">Boulevard du 30 Juin, Gombe, Kinshasa</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="font-bold mb-2">Détail des acomptes à verser directement à chaque prestataire :</div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {items.map((i) => {
                      const dest = payoutFor(i.service.provider.name)
                      return (
                        <div key={i.id} className="py-2 flex justify-between gap-3">
                          <div>
                            <div>{i.service.name} ({i.service.provider.name})</div>
                            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                              → {dest.method ?? "Mobile Money"} {dest.number ? `: ${dest.number}` : ": numéro communiqué après confirmation"}
                            </div>
                          </div>
                          <span className="font-bold shrink-0">{formatPrice(Math.round(i.service.price * 0.5))}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-3 border-t border-zinc-200 pt-2 flex justify-between font-bold text-sm text-emerald-600">
                    <span>Total acompte Mobile Money :</span>
                    <span>{formatPrice(depositUSD)} (≈ {formatPriceFC(depositUSD)})</span>
                  </div>
                </div>

                <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300">
                  <div className="font-bold mb-1">Paiement direct aux prestataires :</div>
                  {Array.from(new Set(items.map((i) => i.service.provider.name))).map((providerName) => {
                    const dest = payoutFor(providerName)
                    return (
                      <div key={providerName}>
                        • {providerName} :{" "}
                        <strong>
                          {dest.method ?? "Mobile Money"}
                          {dest.number ? ` — ${dest.number}` : " — numéro communiqué après confirmation"}
                        </strong>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
