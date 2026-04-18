import { createContext, useContext, useState, ReactNode } from 'react'

export interface PeriodFilter {
  startDate: string | null
  endDate: string | null
}

interface PeriodFilterContextType {
  filter: PeriodFilter
  setFilter: (filter: PeriodFilter) => void
}

const PeriodFilterContext = createContext<PeriodFilterContextType | undefined>(undefined)

export function PeriodFilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<PeriodFilter>({
    startDate: null,
    endDate: null
  })

  return (
    <PeriodFilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </PeriodFilterContext.Provider>
  )
}

export function usePeriodFilter() {
  const context = useContext(PeriodFilterContext)
  if (!context) {
    throw new Error('usePeriodFilter must be used within a PeriodFilterProvider')
  }
  return context
}
