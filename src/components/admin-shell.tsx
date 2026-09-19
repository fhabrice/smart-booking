"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAdmin } from "@/lib/admin-context"
import { useProviderSpace } from "@/lib/provider-context"
import {
  LayoutDashboard,
  Users,
  Store,
  MessageSquare,
  LogOut,
  Sparkles,
  Lock,
  Eye,
  Smartphone,
} from "lucide-react"
import { Button } from "./ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

const adminNav = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/providers", label: "Prestataires", icon: Users, badgeKey: "pendingProviders" },
  { href: "/admin/services", label: "Modération Services", icon: Store, badgeKey: "pendingServices" },
  { href: "/admin/payouts", label: "Retraits Mobile Money", icon: Smartphone, badgeKey: "pendingPayouts" },
  { href: "/admin/messages", label: "Messagerie Prestataires", icon: MessageSquare },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAdmin, login, logout, mounted } = useAdmin()
  const { accounts, customServices, overrides, payoutRequests } = useProviderSpace()

  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState("")

  // Compteurs en attente
  const pendingProvidersCount = accounts.filter((a) => a.status === "pending").length
  const pendingServicesCount = customServices.filter((s) => {
    const o = overrides[s.id]
    const status = o?.adminApprovalStatus ?? s.adminApprovalStatus ?? "pending"
    return status === "pending"
  }).length
  const pendingPayoutsCount = (payoutRequests || []).filter(
    (p) => p.status === "pending" || p.status === "processing"
  ).length

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          <Sparkles className="h-4 w-4 animate-pulse text-amber-500" />
          Chargement de l&apos;administration…
        </div>
      </div>
    )
  }

  // Écran d'authentification administrateur
  if (!isAdmin) {
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault()
      const ok = login(pinInput)
      if (!ok) {
        setPinError("Code administrateur incorrect. Utilisez le code par défaut ou le bouton d'accès rapide.")
      }
    }

    const handleQuickLogin = () => {
      login("admin243")
    }

    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-[#fcfcf9] p-4 dark:bg-zinc-950">
        <div className="max-w-md w-full rounded-[32px] border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-red-500 text-white shadow-lg">
            <Lock className="h-8 w-8" />
          </div>

          <h2 className="mt-5 text-2xl font-bold tracking-tight">Espace Administration</h2>
          <p className="mt-2 text-xs text-zinc-500">
            Gestion des prestataires, modération des publications de services et support de la plateforme Smart Booking RDC 🇨🇩.
          </p>

          {pinError && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {pinError}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1 text-left">
                Code secret Administrateur
              </label>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Entrez le code (ex : admin243)"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-center text-sm font-bold tracking-widest focus:border-amber-500 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black font-bold"
            >
              Déverrouiller l&apos;administration
            </Button>
          </form>

          <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={handleQuickLogin}
              className="w-full gap-2 border-amber-300 text-xs font-bold text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40"
            >
              ⚡ Connexion Administrateur Démo (1-clic)
            </Button>
            <p className="mt-2 text-[10px] text-zinc-400">
              Code par défaut : <code>admin243</code>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[264px_1fr]">
          {/* Sidebar Admin */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 grid gap-4">
              {/* Carte Admin Info */}
              <div className="rounded-[24px] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white text-lg font-bold dark:bg-white dark:text-black">
                    🛡️
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate">Administration RDC</div>
                    <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      Super-Admin Connecté
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="rounded-xl bg-amber-50 p-2 dark:bg-amber-950/40">
                    <div className="font-bold text-amber-700 dark:text-amber-300">{pendingServicesCount}</div>
                    <div className="text-[9px] text-zinc-500 leading-tight">Services</div>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-2 dark:bg-purple-950/40">
                    <div className="font-bold text-purple-700 dark:text-purple-300">{pendingProvidersCount}</div>
                    <div className="text-[9px] text-zinc-500 leading-tight">Prestataires</div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-2 dark:bg-emerald-950/40">
                    <div className="font-bold text-emerald-700 dark:text-emerald-300">{pendingPayoutsCount}</div>
                    <div className="text-[9px] text-zinc-500 leading-tight">Retraits</div>
                  </div>
                </div>
              </div>

              {/* Navigation Admin */}
              <nav className="grid gap-1 rounded-[24px] border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900">
                {adminNav.map((item) => {
                  const active = pathname === item.href
                  const badge =
                    item.badgeKey === "pendingServices" && pendingServicesCount > 0
                      ? pendingServicesCount
                      : item.badgeKey === "pendingProviders" && pendingProvidersCount > 0
                      ? pendingProvidersCount
                      : item.badgeKey === "pendingPayouts" && pendingPayoutsCount > 0
                      ? pendingPayoutsCount
                      : null

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold transition-colors",
                        active
                          ? "bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-black"
                          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      {badge !== null && (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                          {badge}
                        </span>
                      )}
                    </Link>
                  )
                })}

                <div className="my-1.5 h-px bg-zinc-100 dark:bg-zinc-800" />

                <Link
                  href="/"
                  className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <Eye className="h-4 w-4" /> Voir la vitrine publique
                </Link>

                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4" /> Quitter l&apos;administration
                </button>
              </nav>
            </div>
          </aside>

          {/* Contenu principal */}
          <div className="min-w-0">
            {/* Barre de navigation mobile */}
            <div className="mb-6 lg:hidden">
              <div className="flex items-center justify-between gap-3 rounded-[24px] border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <span>🛡️ Administration Smart Booking</span>
                </div>
                <button
                  onClick={logout}
                  className="rounded-full border border-zinc-200 p-2 text-red-600 dark:border-zinc-800"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {adminNav.map((item) => {
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
