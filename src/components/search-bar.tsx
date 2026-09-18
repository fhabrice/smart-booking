"use client"

import { useState } from "react"
import { Search, MapPin, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { categories, cities } from "@/lib/data"

export function SearchBar({
  onSearch,
  onCategoryChange,
  onCityChange,
  activeCategory,
  activeCity,
}: {
  onSearch: (q: string) => void
  onCategoryChange: (cat: string) => void
  onCityChange: (city: string) => void
  activeCategory: string
  activeCity: string
}) {
  const [query, setQuery] = useState("")

  return (
    <div className="w-full">
      {/* Main search */}
      <div className="relative mx-auto flex max-w-3xl flex-col gap-2 rounded-3xl border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20 sm:flex-row sm:items-center sm:rounded-full">
        <div className="flex flex-1 items-center gap-3 pl-3">
          <Search className="h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              onSearch(e.target.value)
            }}
            placeholder="Salle, traiteur, DJ, photographe…"
            className="w-full bg-transparent py-2 text-sm font-medium placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
        <div className="hidden h-8 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />
        <div className="flex flex-1 items-center gap-2 pl-3 sm:pl-0">
          <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
          <select
            value={activeCity}
            onChange={(e) => onCityChange(e.target.value)}
            className="w-full bg-transparent py-2 text-sm font-medium text-zinc-700 focus:outline-none dark:text-zinc-300 dark:[&>option]:bg-zinc-900"
            aria-label="Ville"
          >
            <option value="all">Toute la RDC 🇨🇩</option>
            {cities.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Button className="h-11 gap-2 rounded-full bg-gradient-to-r from-amber-500 to-red-500 px-6 hover:from-amber-600 hover:to-red-600">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Rechercher</span>
        </Button>
      </div>

      {/* Categories */}
      <div className="mt-6 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`group flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? "border-zinc-900 bg-zinc-900 text-white shadow-md dark:border-white dark:bg-white dark:text-black"
                : "border-zinc-200 bg-white/80 text-zinc-600 hover:border-zinc-300 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            {cat.name}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] ${
                activeCategory === cat.id
                  ? "bg-white/20 text-white dark:bg-black/10 dark:text-black"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
