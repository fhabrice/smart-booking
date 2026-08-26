"use client"

import { useState } from "react"
import { Search, MapPin, Calendar, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { categories } from "@/lib/data"

export function SearchBar({ onSearch, onCategoryChange, activeCategory }: {
  onSearch: (q: string) => void
  onCategoryChange: (cat: string) => void
  activeCategory: string
}) {
  const [query, setQuery] = useState("")

  return (
    <div className="w-full">
      {/* Main search */}
      <div className="relative mx-auto flex max-w-3xl items-center gap-2 rounded-full border border-zinc-200 bg-white p-2 shadow-lg shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
        <div className="flex flex-1 items-center gap-3 pl-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <Search className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </div>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              onSearch(e.target.value)
            }}
            placeholder="Que souhaitez-vous réserver ?"
            className="w-full bg-transparent text-sm font-medium placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
        <div className="hidden h-8 w-px bg-zinc-200 dark:bg-zinc-800 md:block" />
        <div className="hidden flex-1 items-center gap-2 pl-2 md:flex">
          <MapPin className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Paris</span>
        </div>
        <div className="hidden h-8 w-px bg-zinc-200 dark:bg-zinc-800 md:block" />
        <div className="hidden items-center gap-2 pl-2 pr-1 md:flex">
          <Calendar className="h-4 w-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Aujourd&apos;hui</span>
        </div>
        <Button className="h-10 gap-2 rounded-full px-6">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Rechercher</span>
        </Button>
      </div>

      {/* Categories */}
      <div className="mt-6 flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`group flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat.id
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black shadow-md"
                : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            {cat.name}
            <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${
              activeCategory === cat.id ? "bg-white/20 text-white dark:bg-black/10 dark:text-black" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
