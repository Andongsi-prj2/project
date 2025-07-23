"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface FilterState {
  dateRange: { start: Date; end: Date }
}

interface FilterContextType {
  filters: FilterState
  updateFilters: (updates: Partial<FilterState>) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end: new Date(),
    },
  })

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  return <FilterContext.Provider value={{ filters, updateFilters }}>{children}</FilterContext.Provider>
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider")
  }
  return context
}
