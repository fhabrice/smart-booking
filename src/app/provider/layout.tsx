"use client"

import { usePathname } from "next/navigation"
import { ProviderShell } from "@/components/provider-shell"

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  // La page /provider est l'écran de connexion — pas de shell
  if (pathname === "/provider") return <>{children}</>
  return <ProviderShell>{children}</ProviderShell>
}
