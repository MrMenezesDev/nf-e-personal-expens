import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/formatters'
import { Note } from '@/lib/types'
import { useMemo, useState } from 'react'
import { MobileFilterDrawer } from '@/components/MobileFilterDrawer'
import { Funnel } from '@phosphor-icons/react'

interface PeriodFilterBarProps {
  notes: Note[]
}

export function PeriodFilterBar({ notes }: PeriodFilterBarProps) {
  const { filter, setFilter } = usePeriodFilter()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const categories = useMemo(() => {
    const categorySet = new Set<string>()
    notes.forEach(note => {
      note.items.forEach(item => {
        if (item.category) {
          categorySet.add(item.category)
        }
      })
    })
    return ['Todas', ...Array.from(categorySet).sort()]
  }, [notes])

  const subcategories = useMemo(() => {
    const subcategorySet = new Set<string>()
    notes.forEach(note => {
      note.items.forEach(item => {
        if (filter.category === 'Todas' || item.category === filter.category) {
          if (item.subcategory) {
            subcategorySet.add(item.subcategory)
          }
        }
      })
    })
    return ['Todas', ...Array.from(subcategorySet).sort()]
  }, [notes, filter.category])

  const handlePreset = (preset: '30days' | '90days' | 'thisyear' | 'all') => {
    const today = new Date()
    let startDate: string | null = null
    let endDate: string | null = null

    switch (preset) {
      case '30days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break
      case '90days':
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break
      case 'thisyear':
        startDate = `${today.getFullYear()}-01-01`
        endDate = today.toISOString().split('T')[0]
        break
      case 'all':
        startDate = null
        endDate = null
        break
    }

    setFilter({ ...filter, startDate, endDate })
  }

  const handleCategoryChange = (category: string) => {
    setFilter({ ...filter, category, subcategory: 'Todas' })
  }

  const handleSubcategoryChange = (subcategory: string) => {
    setFilter({ ...filter, subcategory })
  }

  const displaySummary = () => {
    const parts: string[] = []
    
    if (!filter.startDate && !filter.endDate) {
      parts.push('Todos')
    } else {
      const start = filter.startDate ? formatDate(filter.startDate).slice(3) : '...'
      const end = filter.endDate ? formatDate(filter.endDate).slice(3) : '...'
      parts.push(`${start} – ${end}`)
    }

    if (filter.category !== 'Todas') {
      parts.push(filter.category)
    }

    return parts.join(' | ')
  }

  const displayFullSummary = () => {
    const parts: string[] = []
    
    if (!filter.startDate && !filter.endDate) {
      parts.push('Todos os períodos')
    } else {
      const start = filter.startDate ? formatDate(filter.startDate) : '...'
      const end = filter.endDate ? formatDate(filter.endDate) : '...'
      parts.push(`${start} – ${end}`)
    }

    if (filter.category !== 'Todas') {
      parts.push(`Categoria: ${filter.category}`)
    }

    if (filter.subcategory !== 'Todas') {
      parts.push(`Subcategoria: ${filter.subcategory}`)
    }

    return parts.join(' | ')
  }

  return (
    <>
      <MobileFilterDrawer
        open={mobileDrawerOpen}
        onOpenChange={setMobileDrawerOpen}
        notes={notes}
        currentFilter={filter}
        onApplyFilters={setFilter}
      />

      <div className="border-b bg-card sticky top-14 md:top-16 z-40">
        <div className="md:hidden px-4 py-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="flex items-center justify-between w-full min-h-[44px]"
          >
            <span className="text-sm font-medium truncate pr-2">{displaySummary()}</span>
            <Funnel className="flex-shrink-0 text-muted-foreground" size={20} />
          </button>
        </div>

        <div className="hidden md:block container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Período:</span>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={filter.startDate || ''}
                  onChange={(e) =>
                    setFilter({ ...filter, startDate: e.target.value || null })
                  }
                  className="w-40 h-9 text-sm"
                  id="period-start"
                />
                <span className="text-sm text-muted-foreground">até</span>
                <Input
                  type="date"
                  value={filter.endDate || ''}
                  onChange={(e) =>
                    setFilter({ ...filter, endDate: e.target.value || null })
                  }
                  className="w-40 h-9 text-sm"
                  id="period-end"
                />
              </div>

              <span className="text-sm font-medium text-muted-foreground ml-4">Categoria:</span>
              <Select value={filter.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm font-medium text-muted-foreground">Subcategoria:</span>
              <Select value={filter.subcategory} onValueChange={handleSubcategoryChange}>
                <SelectTrigger className="w-48 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map(sub => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('30days')}
              >
                Últimos 30 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('90days')}
              >
                Últimos 90 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('thisyear')}
              >
                Este ano
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('all')}
              >
                Todos
              </Button>
            </div>
          </div>

          <div className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium">Exibindo:</span> {displayFullSummary()}
          </div>
        </div>
      </div>
    </>
  )
}
