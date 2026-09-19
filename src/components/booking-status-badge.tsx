"use client"

import { Booking } from "@/lib/types"
import { Check, CheckCheck, X, Hourglass } from "lucide-react"
import { cn } from "@/lib/utils"

const statusConfig: Record<Booking["status"], { label: string; icon: typeof Check; className: string }> = {
  pending: {
    label: "En attente",
    icon: Hourglass,
    className: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  confirmed: {
    label: "Confirmée",
    icon: Check,
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  completed: {
    label: "Terminée",
    icon: CheckCheck,
    className: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  },
  cancelled: {
    label: "Annulée",
    icon: X,
    className: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  },
}

export function BookingStatusBadge({ status, className }: { status: Booking["status"]; className?: string }) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
        config.className,
        className
      )}
    >
      <config.icon className="h-3 w-3" />
      {config.label}
    </span>
  )
}

export function statusLabel(status: Booking["status"]) {
  return statusConfig[status].label
}
