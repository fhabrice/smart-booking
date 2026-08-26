"use client"

import { useState } from "react"
import { Search, MapPin, Calendar, Sparkles } from "lucide-react"
import { Button } from "./ui/button"
import { categories, provinces } from "@/lib/data"

export function SearchBar({ 
  onSearch, 
  onCategoryChange, 
  onProvinceChange,
  activeCategory,
  activeProvince
}: {
  onSearch: (q: string) => void
  onCategoryChange: (cat: string) => void
  onProvinceChange: (prov: string) => void
  activeCategory: string
  activeProvince: string
}) {
  const [query, setQuery] = useState("")

  return (
    <div className="w-full">
      {/* Main search */}
      <div className="relative mx-auto flex max-w-4xl flex-col gap-2 rounded-[24px] border border-zinc-200 bg-white p-3 shadow-xl shadow-zinc-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20 sm:flex-row sm:items-center sm:rounded-full sm:p-2">
        <div className="flex flex-1 items-center gap-3 pl-2 sm:pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-black">
            <Search className="h-4 w-4" />
          </div>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              onSearch(e.target.value)
            }}
            placeholder="Mariage, salle, traiteur, DJ..."
            className="w-full bg-transparent text-sm font-medium placeholder:text-zinc-400 focus:outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex flex-1 items-center gap-2 rounded-full bg-zinc-50 px-3 py-2.5 dark:bg-zinc-800 sm:w-[180px]">
            <MapPin className="h-4 w-4 text-zinc-500" />
            <select
              value={activeProvince}
              onChange={(e) => onProvinceChange(e.target.value)}
              className="w-full bg-transparent text-sm font-medium focus:outline-none dark:text-white"
            >
              <option value="all">Toutes provinces</option>
              {provinces.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.capital})</option>
              ))}
            </select>
          </div>
          
          <div className="hidden items-center gap-2 pl-2 pr-1 md:flex">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">RDC 🇨🇩</span>
          </div>
          
          <Button className="h-11 gap-2 rounded-full px-6 shrink-0">
            <Sparkles className="h-4 w-4" />
            <span>Rechercher</span>
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`group flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black shadow-md"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
              title={cat.description}
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

        {/* Provinces quick filter */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-medium text-zinc-500 shrink-0">📍 Provinces:</span>
          {[
            { id: "all", name: "Toutes" },
            { id: "nord-kivu", name: "Nord-Kivu" },
            { id: "sud-kivu", name: "Sud-Kivu" },
            { id: "kinshasa", name: "Kinshasa" },
            { id: "haut-katanga", name: "Lubumbashi" },
          ].map(prov => (
            <button
              key={prov.id}
              onClick={() => onProvinceChange(prov.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                activeProvince === prov.id
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {prov.name}
            </button>
          ))}
          <span className="text-[11px] text-zinc-400 shrink-0 ml-2">🇨🇩 RDC entière couverte</span>
        </div>
      </div>
    </div>
  )
}
