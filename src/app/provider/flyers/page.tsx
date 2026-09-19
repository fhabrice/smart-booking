"use client"

import { useState } from "react"
import { useProviderSpace, useProviderServices, useProviderProfile } from "@/lib/provider-context"
import { formatPrice, formatPriceFC } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Palette,
  Download,
  Share2,
  Copy,
  Check,
  Phone,
  MapPin,
  BadgeCheck,
} from "lucide-react"

type ThemeConfig = {
  id: "gold" | "dark" | "rose" | "emerald"
  name: string
  bgGradient: string
  cardBg: string
  accentColor: string
  textColor: string
  badgeBg: string
  canvasColors: {
    bgTop: string
    bgBottom: string
    accent: string
    text: string
    subtext: string
    badgeBg: string
  }
}

const THEMES: Record<string, ThemeConfig> = {
  gold: {
    id: "gold",
    name: "🌟 Or Prestige & Noir",
    bgGradient: "from-zinc-950 via-zinc-900 to-amber-950",
    cardBg: "bg-zinc-900/90 border-amber-500/30",
    accentColor: "text-amber-400",
    textColor: "text-white",
    badgeBg: "bg-gradient-to-r from-amber-500 to-yellow-400 text-black",
    canvasColors: {
      bgTop: "#09090b",
      bgBottom: "#451a03",
      accent: "#fbbf24",
      text: "#ffffff",
      subtext: "#d4d4d8",
      badgeBg: "#f59e0b",
    },
  },
  dark: {
    id: "dark",
    name: "⚡ Nuit Électrique & Sono",
    bgGradient: "from-slate-950 via-indigo-950 to-blue-950",
    cardBg: "bg-slate-900/90 border-blue-500/30",
    accentColor: "text-blue-400",
    textColor: "text-white",
    badgeBg: "bg-gradient-to-r from-blue-500 to-cyan-400 text-white",
    canvasColors: {
      bgTop: "#020617",
      bgBottom: "#1e1b4b",
      accent: "#60a5fa",
      text: "#ffffff",
      subtext: "#cbd5e1",
      badgeBg: "#3b82f6",
    },
  },
  rose: {
    id: "rose",
    name: "🌸 Cérémonie Rose & Ivoire",
    bgGradient: "from-rose-950 via-pink-900 to-zinc-950",
    cardBg: "bg-rose-950/80 border-rose-500/30",
    accentColor: "text-rose-300",
    textColor: "text-white",
    badgeBg: "bg-gradient-to-r from-pink-500 to-rose-400 text-white",
    canvasColors: {
      bgTop: "#4c0519",
      bgBottom: "#18181b",
      accent: "#fda4af",
      text: "#ffffff",
      subtext: "#fecdd3",
      badgeBg: "#f43f5e",
    },
  },
  emerald: {
    id: "emerald",
    name: "🌿 Émeraude & Nature RDC",
    bgGradient: "from-emerald-950 via-zinc-950 to-teal-950",
    cardBg: "bg-emerald-950/80 border-emerald-500/30",
    accentColor: "text-emerald-400",
    textColor: "text-white",
    badgeBg: "bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-bold",
    canvasColors: {
      bgTop: "#022c22",
      bgBottom: "#09090b",
      accent: "#34d399",
      text: "#ffffff",
      subtext: "#a7f3d0",
      badgeBg: "#10b981",
    },
  },
}

export default function ProviderFlyersPage() {
  const { session, currentAccount } = useProviderSpace()
  const providerServices = useProviderServices(session ?? "")
  const providerProfile = useProviderProfile(session ?? "")

  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    providerServices[0]?.id || ""
  )
  const [headline, setHeadline] = useState("✨ OFFRE SPÉCIALE CÉRÉMONIE 2026")
  const [tagline, setTagline] = useState("Réservez dès maintenant pour votre mariage, dot ou réception !")
  const [customPrice, setCustomPrice] = useState("")
  const [promoBadge, setPromoBadge] = useState("🔥 -15% CE MOIS-CI")
  const [selectedTheme, setSelectedTheme] = useState<keyof typeof THEMES>("gold")
  const [whatsappContact, setWhatsappContact] = useState(
    currentAccount?.whatsapp || providerProfile.whatsapp || "+243 821 110 021"
  )
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const effectiveServiceId = selectedServiceId || providerServices[0]?.id || ""
  const activeService =
    providerServices.find((s) => s.id === effectiveServiceId) || providerServices[0]

  const theme = THEMES[selectedTheme]
  const displayPrice = customPrice ? Number(customPrice) : activeService?.price || 500

  // Téléchargement d'affiche via HTML5 Canvas (HD 1080x1080)
  const handleDownload = async () => {
    setDownloading(true)
    try {
      const canvas = document.createElement("canvas")
      canvas.width = 1080
      canvas.height = 1080
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Fond dégradé
      const grad = ctx.createLinearGradient(0, 0, 1080, 1080)
      grad.addColorStop(0, theme.canvasColors.bgTop)
      grad.addColorStop(1, theme.canvasColors.bgBottom)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 1080, 1080)

      // Motifs décoratifs
      ctx.strokeStyle = theme.canvasColors.accent + "33"
      ctx.lineWidth = 4
      ctx.strokeRect(40, 40, 1000, 1000)
      ctx.strokeStyle = theme.canvasColors.accent + "66"
      ctx.lineWidth = 2
      ctx.strokeRect(55, 55, 970, 970)

      // Header Brand
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 32px sans-serif"
      ctx.fillText("✦ SMART BOOKING RDC 🇨🇩", 80, 110)

      ctx.fillStyle = theme.canvasColors.accent
      ctx.font = "bold 26px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(currentAccount?.name || session || "Prestataire Vérifié", 1000, 110)
      ctx.textAlign = "left"

      // Headline
      ctx.fillStyle = theme.canvasColors.accent
      ctx.font = "bold 38px sans-serif"
      ctx.fillText(headline, 80, 180)

      // Nom de la prestation
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 52px sans-serif"
      const serviceTitle = activeService?.name || "Prestation de prestige"
      ctx.fillText(serviceTitle.slice(0, 36), 80, 250)

      // Sous-titre
      ctx.fillStyle = theme.canvasColors.subtext
      ctx.font = "28px sans-serif"
      ctx.fillText(tagline.slice(0, 60), 80, 300)

      // Badge Promo
      if (promoBadge) {
        ctx.fillStyle = theme.canvasColors.badgeBg
        ctx.beginPath()
        ctx.roundRect(80, 330, 320, 50, 25)
        ctx.fill()
        ctx.fillStyle = "#000000"
        ctx.font = "bold 24px sans-serif"
        ctx.fillText(promoBadge, 105, 365)
      }

      // Dessiner l'image du service si possible
      if (activeService?.image) {
        try {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.src = activeService.image
          await new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
          })
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(80, 410, 920, 400, 24)
          ctx.clip()
          ctx.drawImage(img, 80, 410, 920, 400)
          ctx.restore()
        } catch {}
      }

      // Bloc Tarif & Mobile Money
      ctx.fillStyle = "#ffffff15"
      ctx.beginPath()
      ctx.roundRect(80, 840, 520, 160, 20)
      ctx.fill()

      ctx.fillStyle = theme.canvasColors.accent
      ctx.font = "bold 48px sans-serif"
      ctx.fillText(`${formatPrice(displayPrice)}`, 110, 905)

      ctx.fillStyle = "#ffffff"
      ctx.font = "26px sans-serif"
      ctx.fillText(`≈ ${formatPriceFC(displayPrice)}`, 110, 945)

      ctx.fillStyle = theme.canvasColors.subtext
      ctx.font = "22px sans-serif"
      ctx.fillText("Acompte 50% Mobile Money • Annulation 72h", 110, 980)

      // Bloc Contact & QR
      ctx.fillStyle = "#ffffff15"
      ctx.beginPath()
      ctx.roundRect(620, 840, 380, 160, 20)
      ctx.fill()

      ctx.fillStyle = "#22c55e"
      ctx.font = "bold 28px sans-serif"
      ctx.fillText("WhatsApp Réservation :", 650, 895)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 32px sans-serif"
      ctx.fillText(whatsappContact, 650, 945)

      ctx.fillStyle = theme.canvasColors.subtext
      ctx.font = "20px sans-serif"
      ctx.fillText(`${activeService?.city || "Kinshasa"} • Smart Booking RDC`, 650, 980)

      // Export PNG
      const dataUrl = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `affiche-${(session || "prestataire").toLowerCase().replace(/\s+/g, "-")}.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error(e)
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyText = () => {
    const text = `🇨🇩 *${headline}*\n\n` +
      `*${activeService?.name || session}*\n` +
      `${tagline}\n\n` +
      `💰 *Tarif Spécial* : ${formatPrice(displayPrice)} (≈ ${formatPriceFC(displayPrice)})\n` +
      `⚡ *Acompte garanti 50%* via M-Pesa, Orange Money, Airtel Money\n` +
      `📍 *Ville* : ${activeService?.city || "Kinshasa"} (${activeService?.location || "Centre-ville"})\n\n` +
      `📲 Contact WhatsApp direct : ${whatsappContact}\n` +
      `Réservez en ligne sur Smart Booking RDC !`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const handleShareWhatsApp = () => {
    const text = `🇨🇩 *${headline}*\n\n` +
      `*${activeService?.name || session}*\n` +
      `${tagline}\n\n` +
      `💰 Tarif : ${formatPrice(displayPrice)} (≈ ${formatPriceFC(displayPrice)})\n` +
      `📲 Réservez avec moi sur WhatsApp au ${whatsappContact} via Smart Booking RDC !`

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, "_blank")
  }

  if (!session) return null

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <Palette className="h-3.5 w-3.5" /> Outil Marketing Prestataire
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Générateur d&apos;Affiches Publicitaires</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Créez en 30 secondes une affiche professionnelle pour vos statuts WhatsApp, Instagram et Facebook.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleDownload} disabled={downloading} className="gap-2 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600">
            <Download className="h-4 w-4" />
            {downloading ? "Génération…" : "Télécharger l'affiche (PNG HD)"}
          </Button>
          <Button variant="outline" onClick={handleShareWhatsApp} className="gap-2 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400">
            <Share2 className="h-4 w-4" /> Partager sur WhatsApp
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Colonne gauche : Formulaire de personnalisation */}
        <div className="space-y-6 rounded-[28px] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
          <h3 className="font-bold text-base">Personnaliser votre annonce</h3>

          {/* Choix de la prestation */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Prestation à mettre en avant
            </label>
            {providerServices.length > 0 ? (
              <select
                value={effectiveServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-medium focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              >
                {providerServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatPrice(s.price)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-zinc-500">
                Vous n&apos;avez pas encore de prestation. Créez-en une dans &quot;Mes prestations&quot;.
              </p>
            )}
          </div>

          {/* Choix du Thème Visuel */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Thème graphique de l&apos;affiche
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`rounded-2xl border p-3 text-left text-xs font-bold transition-all ${
                    selectedTheme === t.id
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm"
                      : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Accroche & Titre */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Titre d&apos;accroche publicitaire
              </label>
              <input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Ex : PACK CÉRÉMONIE VIP 2026"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Slogan / Message d&apos;appel à l&apos;action
              </label>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Ex : Réservez votre date dès maintenant !"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          {/* Badge & Prix promotionnel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Badge promo (ex: -15%, Offre Limitée)
              </label>
              <input
                value={promoBadge}
                onChange={(e) => setPromoBadge(e.target.value)}
                placeholder="Ex : 🔥 -20% CE WEEK-END"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Prix spécial USD (laisser vide si standard)
              </label>
              <input
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder={activeService ? `${activeService.price}` : "500"}
                type="number"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          {/* Coordonnées WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Numéro WhatsApp affiché sur l&apos;affiche
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
              <input
                value={whatsappContact}
                onChange={(e) => setWhatsappContact(e.target.value)}
                placeholder="+243 8xx xxx xxx"
                type="tel"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-2 pl-10 pr-4 text-xs font-medium focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          {/* Copie du texte promotionnel */}
          <div className="border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={handleCopyText}
              className="w-full gap-2 text-xs"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copied ? "Texte publicitaire copié dans le presse-papier !" : "Copier le texte d'annonce (Statut & Posts)"}
            </Button>
          </div>
        </div>

        {/* Colonne droite : Prévisualisation Haute Définition de l'affiche */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
            <span>Prévisualisation du flyer (Format Carré 1:1)</span>
            <span className="text-amber-600">Résolution HD 1080×1080</span>
          </div>

          <div
            className={`relative aspect-square w-full overflow-hidden rounded-[32px] p-6 shadow-2xl bg-gradient-to-br ${theme.bgGradient} text-white border border-white/10 flex flex-col justify-between`}
          >
            {/* Header Flyer */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-red-500 text-xs font-bold text-white">
                  ✦
                </div>
                <div>
                  <span className="text-xs font-bold tracking-wider">SMART BOOKING RDC</span>
                  <span className="block text-[9px] text-white/70">Plateforme certifiée 🇨🇩</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-bold">
                  <span>{session}</span>
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="text-[10px] text-white/60">Prestataire Officiel</div>
              </div>
            </div>

            {/* Centre Flyer */}
            <div className="space-y-3 my-auto">
              <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-amber-300 backdrop-blur">
                {headline}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {activeService?.name || "Prestation de Réception"}
              </h2>

              <p className="text-xs text-white/80 line-clamp-2">{tagline}</p>

              {promoBadge && (
                <div>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-extrabold uppercase shadow-md ${theme.badgeBg}`}>
                    {promoBadge}
                  </span>
                </div>
              )}

              {/* Photo */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/20 shadow-lg">
                <img
                  src={activeService?.image || "/images/hero.jpg"}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] backdrop-blur">
                  <MapPin className="h-3 w-3 text-amber-400" />
                  {activeService?.city || "Kinshasa"} · {activeService?.location || "Centre"}
                </div>
              </div>
            </div>

            {/* Footer Flyer */}
            <div className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur flex items-center justify-between gap-3">
              <div>
                <div className="text-xl font-black text-amber-300 leading-none">
                  {formatPrice(displayPrice)}
                </div>
                <div className="text-[10px] text-white/80 mt-0.5">
                  ≈ {formatPriceFC(displayPrice)} • Acompte 50%
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold text-emerald-400 flex items-center justify-end gap-1">
                  <Phone className="h-3 w-3" /> WhatsApp
                </div>
                <div className="text-xs font-bold text-white">{whatsappContact}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 font-bold"
            >
              <Download className="h-4 w-4" /> Télécharger mon affiche (PNG)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
