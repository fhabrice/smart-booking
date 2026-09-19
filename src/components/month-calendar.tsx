"use client"

import type { ReactNode } from "react"
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { cn, clampToBookableRange, isoDay } from "@/lib/utils"

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

/** Raccourcis « dans N mois » proposés sous le calendrier */
const SHORTCUT_MONTHS = [1, 3, 6, 12]

type MonthCalendarProps = {
  /** Mois affiché (n'importe quel jour du mois visé) */
  viewMonth: Date
  onViewMonthChange: (month: Date) => void
  /** Jour sélectionné, `null` si aucun */
  selected: Date | null
  onSelect: (date: Date) => void
  /** Bornes de navigation et de sélection */
  minDate: Date
  maxDate: Date
  /** Raccourcis « dans 1/3/6/12 mois » (défaut : vrai) */
  showShortcuts?: boolean
  /** Champ natif type="date" pour un saut direct (défaut : vrai) */
  showNativePicker?: boolean
  /** Contenu additionnel d'une cellule (pastilles de réservation, compteurs…) */
  renderCellExtra?: (date: Date) => ReactNode
  /** Règle métier en plus de la fenêtre de dates (ex. : jours déjà réservés) */
  isSelectable?: (date: Date) => boolean
  className?: string
}

/**
 * Calendrier mensuel navigable, borné par [minDate, maxDate].
 *
 * Remplace les bandeaux de jours fixes (14 / 30 jours) : on peut sauter directement
 * à un mois/année, utiliser les raccourcis « dans 1/3/6/12 mois » ou saisir une date
 * précise dans le champ natif, jusqu'à l'horizon de réservation (24 mois).
 */
export function MonthCalendar({
  viewMonth,
  onViewMonthChange,
  selected,
  onSelect,
  minDate,
  maxDate,
  showShortcuts = true,
  showNativePicker = true,
  renderCellExtra,
  isSelectable,
  className,
}: MonthCalendarProps) {
  const today = startOfDay(new Date())
  const monthStart = startOfMonth(viewMonth)
  const minMonth = startOfMonth(minDate)
  const maxMonth = startOfMonth(maxDate)

  const gridDays = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
  })

  const goToMonth = (date: Date) => {
    const target = startOfMonth(date)
    if (target < minMonth) return onViewMonthChange(minMonth)
    if (target > maxMonth) return onViewMonthChange(maxMonth)
    onViewMonthChange(target)
  }

  /** Sélectionne une date (bornée) et aligne le mois affiché */
  const pick = (date: Date) => {
    onSelect(date)
    goToMonth(date)
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2021, i, 1), "MMMM", { locale: fr }),
  }))
  const yearOptions = Array.from(
    { length: maxMonth.getFullYear() - minMonth.getFullYear() + 1 },
    (_, i) => minMonth.getFullYear() + i
  )

  return (
    <div className={cn("rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900", className)}>
      {/* En-tête : navigation + saut direct mois/année */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Mois précédent"
          disabled={monthStart <= minMonth}
          onClick={() => goToMonth(addMonths(monthStart, -1))}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
            monthStart <= minMonth
              ? "cursor-not-allowed border-zinc-100 text-zinc-300 dark:border-zinc-800 dark:text-zinc-700"
              : "border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 items-center gap-1.5">
          <select
            aria-label="Mois"
            value={monthStart.getMonth()}
            onChange={(e) => goToMonth(new Date(monthStart.getFullYear(), Number(e.target.value), 1))}
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs font-semibold capitalize focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:[&>option]:bg-zinc-900"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Année"
            value={monthStart.getFullYear()}
            onChange={(e) => goToMonth(new Date(Number(e.target.value), monthStart.getMonth(), 1))}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs font-semibold focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:[&>option]:bg-zinc-900"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          aria-label="Mois suivant"
          disabled={monthStart >= maxMonth}
          onClick={() => goToMonth(addMonths(monthStart, 1))}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
            monthStart >= maxMonth
              ? "cursor-not-allowed border-zinc-100 text-zinc-300 dark:border-zinc-800 dark:text-zinc-700"
              : "border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Champ natif : saut direct à une date précise */}
      {showNativePicker && (
        <div className="mt-2.5 flex items-center gap-2">
          <label className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-zinc-500">
            <CalendarDays className="h-3.5 w-3.5" /> Date précise
          </label>
          <input
            type="date"
            value={selected ? isoDay(selected) : ""}
            min={isoDay(minDate)}
            max={isoDay(maxDate)}
            onChange={(e) => {
              const raw = e.target.value
              if (!raw) return
              const iso = clampToBookableRange(raw)
              const parsed = new Date(`${iso}T00:00:00`)
              if (Number.isNaN(parsed.getTime())) return
              pick(parsed)
            }}
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 text-xs font-medium focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:[color-scheme:dark]"
          />
          <button
            type="button"
            onClick={() => pick(today < minDate ? minDate : today)}
            disabled={today < minDate}
            className="shrink-0 rounded-full border border-zinc-200 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
          >
            Auj.
          </button>
        </div>
      )}

      {/* Grille du mois */}
      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="pb-1 text-center text-[9px] font-bold uppercase text-zinc-400">
            {label}
          </div>
        ))}
        {gridDays.map((day) => {
          const inMonth = isSameMonth(day, monthStart)
          const outOfRange = isBefore(day, minDate) || isAfter(day, maxDate)
          const selectable = inMonth && !outOfRange && (isSelectable ? isSelectable(day) : true)
          const isSelected = selected ? isSameDay(day, selected) : false
          const isToday = isSameDay(day, today)

          if (!inMonth) {
            return <div key={isoDay(day)} aria-hidden className="h-11 rounded-xl" />
          }

          return (
            <button
              key={isoDay(day)}
              type="button"
              disabled={!selectable}
              onClick={() => onSelect(day)}
              className={cn(
                "flex h-11 flex-col items-center justify-center gap-0.5 rounded-xl border text-xs transition-all",
                isSelected
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : isToday
                    ? "border-amber-300 bg-amber-50 font-bold text-amber-800 dark:border-amber-700/60 dark:bg-amber-500/10 dark:text-amber-300"
                    : selectable
                      ? "border-zinc-100 bg-zinc-50 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
                      : "cursor-not-allowed border-zinc-100 text-zinc-300 dark:border-zinc-800/60 dark:text-zinc-600"
              )}
            >
              <span className="font-semibold leading-none">{format(day, "d")}</span>
              {renderCellExtra?.(day)}
            </button>
          )
        })}
      </div>

      {/* Raccourcis */}
      {showShortcuts && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-2.5 dark:border-zinc-800">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Aller à</span>
          {SHORTCUT_MONTHS.map((n) => {
            const target = addMonths(today, n)
            const disabled = isAfter(target, maxDate)
            return (
              <button
                key={n}
                type="button"
                disabled={disabled}
                onClick={() => pick(isAfter(target, maxDate) ? maxDate : target)}
                className="rounded-full border border-zinc-200 px-2.5 py-1 text-[11px] font-medium text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
              >
                +{n} mois
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
