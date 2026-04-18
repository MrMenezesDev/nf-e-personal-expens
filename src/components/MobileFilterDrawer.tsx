import { useState, useEffect, useMemo } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Note } from '@/lib/types'
import { PeriodFilter } from '@/contexts/PeriodFilterContext'

interface MobileFilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notes: Note[]
  currentFilter: PeriodFilter
  onApplyFilters: (filter: PeriodFilter) => void
}

export function MobileFilterDrawer({
  open,
  onOpenChange,
  notes,
  currentFilter,
  onApplyFilters
}: MobileFilterDrawerProps) {
  const [localFilter, setLocalFilter] = useState<PeriodFilter>(currentFilter)

  useEffect(() => {
    if (open) {
      setLocalFilter(currentFilter)
    }
  }, [open, currentFilter])

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
        if (localFilter.category === 'Todas' || item.category === localFilter.category) {
          if (item.subcategory) {
            subcategorySet.add(item.subcategory)
          }
        }
      })
    })
    return ['Todas', ...Array.from(subcategorySet).sort()]
  }, [notes, localFilter.category])

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

    setLocalFilter({ ...localFilter, startDate, endDate })
  }

  const handleApply = () => {
    onApplyFilters(localFilter)
    onOpenChange(false)
  }

  const handleClear = () => {
    const clearedFilter: PeriodFilter = {
      startDate: null,
      endDate: null,
      category: 'Todas',
      subcategory: 'Todas'
    }
    setLocalFilter(clearedFilter)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="mobile-period-start" className="text-base font-semibold">
              Período
            </Label>
            <div className="space-y-2">
              <div>
                <Label htmlFor="mobile-period-start" className="text-sm text-muted-foreground">
                  De
                </Label>
                <Input
                  id="mobile-period-start"
                  type="date"
                  value={localFilter.startDate || ''}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, startDate: e.target.value || null })
                  }
                  className="w-full h-12"
                />
              </div>
              <div>
                <Label htmlFor="mobile-period-end" className="text-sm text-muted-foreground">
                  Até
                </Label>
                <Input
                  id="mobile-period-end"
                  type="date"
                  value={localFilter.endDate || ''}
                  onChange={(e) =>
                    setLocalFilter({ ...localFilter, endDate: e.target.value || null })
                  }
                  className="w-full h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('30days')}
                className="h-11"
              >
                Últimos 30 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('90days')}
                className="h-11"
              >
                Últimos 90 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('thisyear')}
                className="h-11"
              >
                Este ano
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset('all')}
                className="h-11"
              >
                Todos
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="mobile-category" className="text-base font-semibold">
              Categoria
            </Label>
            <Select
              value={localFilter.category}
              onValueChange={(value) =>
                setLocalFilter({ ...localFilter, category: value, subcategory: 'Todas' })
              }
            >
              <SelectTrigger id="mobile-category" className="w-full h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="mobile-subcategory" className="text-base font-semibold">
              Subcategoria
            </Label>
            <Select
              value={localFilter.subcategory}
              onValueChange={(value) =>
                setLocalFilter({ ...localFilter, subcategory: value })
              }
            >
              <SelectTrigger id="mobile-subcategory" className="w-full h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map(sub => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 space-y-3 pb-6">
            <Button
              onClick={handleApply}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Aplicar Filtros
            </Button>
            <Button
              onClick={handleClear}
              variant="ghost"
              className="w-full h-12 text-base"
              size="lg"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
