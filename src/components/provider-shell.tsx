"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  LayoutDashboard,
  Ticket,
  Store,
  CalendarClock,
  Wallet,
  Eye,
  LogOut,
  BadgeCheck,
  Star,
  Sparkles,
  Palette,
  BarChart3,
  MessageSquare,
  Headphones,
  AlertTriangle,
} from "lucide-react"
import { useProviderSpace } from "@/lib/provider-context"
import { useBookings } from "@/lib/booking-context"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/provider/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/provider/bookings", label: "Demandes clients", icon: Ticket, badge: true },
  { href: "/provider/services", label: "Mes prestations", icon: Store },
  { href: "/provider/flyers", label: "Créateur d'affiches", icon: Palette },
  { href: "/provider/reports", label: "Rapports & Chiffres", icon: BarChart3 },
  { href: "/provider/messages", label: "Messages clients", icon: MessageSquare },
  { href: "/provider/support", label: "Assistance Admin", icon: Headphones },
  { href: "/provider/agenda", label: "Agenda", icon: CalendarClock },
  { href: "/provider/profile", label: "Profil & Retraits", icon: Wallet },
]

export function ProviderShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { session, currentAccount, mounted, logout } = useProviderSpace()
  const { bookings } = useBookings()

  useEffect(() => {
    if (mounted && !session) router.replace("/provider")
  }, [mounted, session, router])

  const pendingCount = session
    ? bookings.filter((b) => b.providerName === session && b.status === "pending").length
    : 0

  if (!mounted || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          <Sparkles className="h-4 w-4 animate-pulse text-amber-500" />
          Chargement de l&apos;espace prestataire…
        </div>
      </div>
    )
  }

  const providerName = session
  const isPendingApproval = currentAccount?.status === "pending"
  const isSuspended = currentAccount?.status === "suspended"

  const handleLogout = () => {
    logout()
    router.push("/provider")
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Alerte si le compte est en attente ou suspendu */}
        {isPendingApproval && (
          <div className="mb-6 flex items-start gap-3 rounded-[24px] border border-amber-300 bg-amber-50 p-4 text-xs dark:border-amber-900/50 dark:bg-amber-950/30">
            <Sparkles className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-900 dark:text-amber-200">
                Compte en attente de vérification administrative :
              </span>{" "}
              <span className="text-amber-800 dark:text-amber-300">
                Votre profil a bien été créé. Vous pouvez déjà ajouter vos prestations, concevoir vos affiches publicitaires et explorer vos rapports. Vos prestations seront validées par l&apos;administration Smart Booking avant d&apos;apparaître sur la vitrine publique.
              </span>
            </div>
            <Link
              href="/provider/support"
              className="font-bold text-amber-900 underline hover:opacity-80 dark:text-amber-200"
            >
              Écrire à l&apos;admin
            </Link>
          </div>
        )}

        {isSuspended && (
          <div className="mb-6 flex items-start gap-3 rounded-[24px] border border-red-300 bg-red-50 p-4 text-xs dark:border-red-900/50 dark:bg-red-950/30">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-red-900 dark:text-red-200">Compte actuellement suspendu :</span>{" "}
              <span className="text-red-800 dark:text-red-300">
                Votre compte prestataire a été désactivé par l&apos;équipe d&apos;administration. Vos prestations sont temporairement masquées de la vitrine. Contactez le support administrateur pour régulariser votre situation.
              </span>
            </div>
            <Link
              href="/provider/support"
              className="font-bold text-red-900 underline hover:opacity-80 dark:text-red-200"
            >
              Support admin
            </Link>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[264px_1fr]">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 grid gap-4">
              {/* Identity card */}
              <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-lg font-bold text-white">
                      {providerName.charAt(0)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{providerName}</div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {currentAccount?.verified ? (
                        <>
                          <BadgeCheck className="h-3.5 w-3.5" /> Prestataire vérifié
                        </>
                      ) : isPendingApproval ? (
                        <span className="text-amber-600 font-bold">🟡 En validation admin</span>
                      ) : (
                        <span>Partenaire Smart Booking</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-800/60">
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> Note moyenne
                  </span>
                  <span className="font-bold">{currentAccount?.rating?.toFixed(1) || "4,9"}/5</span>
                </div>
              </div>

              {/* Nav */}
              <nav className="grid gap-1 rounded-[24px] border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900">
                {nav.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-3.5 py-2 text-xs font-semibold transition-colors",
                        active
                          ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-black"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      {item.badge && pendingCount > 0 && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  )
                })}
                <div className="my-1.5 h-px bg-zinc-100 dark:bg-zinc-800" />
                <Link
                  href="/"
                  className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <Eye className="h-4 w-4" /> Voir la vitrine publique
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-left text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4" /> Se déconnecter
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0">
            {/* Mobile nav */}
            <div className="mb-6 lg:hidden">
              <div className="flex items-center justify-between gap-3 rounded-[24px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-sm font-bold text-white">
                    {providerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold">{providerName}</div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      {currentAccount?.verified ? (
                        <>
                          <BadgeCheck className="h-3 w-3" /> Vérifié
                        </>
                      ) : (
                        <span className="text-amber-600">En validation</span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-red-600 dark:border-zinc-800"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
              <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {nav.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                        active
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                          : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                      )}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                      {item.badge && pendingCount > 0 && (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                          {pendingCount}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
