import { useMemo, useState } from 'react'
import { Note, NoteItem } from '@/lib/types'
import { Note, NoteItem } from '@/lib/types'
import { formatCurrency, parseMonthFromDate, formatDate } from '@/lib/formatters'
  YAxis, 
  Tooltip, 
  PieCh
  Cell,
  Area,
} from 'recharts'
import { fi
import { Button } from
  Table,
  Tabl
  Table
} from '@
  Area,
  AreaChart
} from 'recharts'
import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
import { filterNotesByPeriod } from '@/lib/utils'
import { X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CategoriesPageProps {
  notes: Note[]
 

const CHART_COLORS = [
  'oklch(0.45 0.12 200)',

  'oklch(0.55 0.22 25)',
  }, [notes, filter])
  'oklch(0.65 0.18 280)',
    const items: ItemWit
  'oklch(0.60 0.14 180)',
        items.push({
  'oklch(0.68 0.12 120)',
  'oklch(0.58 0.16 240)',
]

interface ItemWithNote extends NoteItem {
  issued_date: string
  merchant_name: string
 

export function CategoriesPage({ notes }: CategoriesPageProps) {
  const { filter } = usePeriodFilter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredNotes = useMemo(() => {
    return filterNotesByPeriod(notes, filter.startDate, filter.endDate)
        categorizedCo

  const allItems = useMemo(() => {
    const items: ItemWithNote[] = []
    filteredNotes.forEach(note => {
      note.items.forEach(item => {
        items.push({
          ...item,
          issued_date: note.issued_date,
          merchant_name: note.merchant_name
        })
      })
  cons
    return items
    filteredItems.for

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return allItems
    return allItems.filter(item => item.category === selectedCategory)
  }, [allItems, selectedCategory])

  const kpis = useMemo(() => {
    const categories = new Set<string>()
    const subcategories = new Set<string>()
    let categorizedCount = 0
    let uncategorizedCount = 0

    allItems.forEach(item => {
      if (item.category && item.category !== 'Outros') {
        categories.add(item.category)
        categorizedCount++
      } else {
        uncategorizedCount++
      }

      if (item.subcategory && item.subcategory !== 'Outros') {
        subcategories.add(item.subcategory)
      }


      }
      categoriesCount: categories.size,
      subcategoriesCount: subcategories.size,
      categorizedCount,
      uncategorizedCount
    }
  }, [allItems])

      .sort((a, b) => a[0].localeCompare(b
    const categoryTotals = new Map<string, number>()

    filteredItems.forEach(item => {
        return entry
      const current = categoryTotals.get(category) || 0
      categoryTotals.set(category, current + item.line_total)
    })

    const data = Array.from(categoryTotals.entries())
  }, [filteredItems, selectedCategory])
      .sort((a, b) => b.value - a.value)

    const total = data.reduce((sum, item) => sum + item.value, 0)

    return { data, total }
          <p classNam

  const subcategorySpending = useMemo(() => {
    const subcategoryTotals = new Map<string, number>()

    filteredItems.forEach(item => {
      const subcategory = item.subcategory || 'Sem Subcategoria'
      const current = subcategoryTotals.get(subcategory) || 0
      subcategoryTotals.set(subcategory, current + item.line_total)
    })

    return Array.from(subcategoryTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
          <span cla
  }, [filteredItems])

  const categoryOverTime = useMemo(() => {
    const monthCategoryMap = new Map<string, Map<string, number>>()

    filteredItems.forEach(item => {
      const month = parseMonthFromDate(item.issued_date)
      const category = item.category || 'Sem Categoria'

      if (!monthCategoryMap.has(month)) {
        monthCategoryMap.set(month, new Map())
      }

      const categoryMap = monthCategoryMap.get(month)!
      const current = categoryMap.get(category) || 0
      categoryMap.set(category, current + item.line_total)
    })

    const categories = Array.from(
      new Set(filteredItems.map(item => item.category || 'Sem Categoria'))
    ).sort()

    const data = Array.from(monthCategoryMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, categoryMap]) => {
        const entry: { month: string; [key: string]: number | string } = { month }
        categories.forEach(category => {
          entry[category] = categoryMap.get(category) || 0
        })
          </CardHead
      })

    return { data, categories }
  }, [filteredItems])

  const itemsForCategory = useMemo(() => {
    if (!selectedCategory) return []
    return filteredItems.filter(item => item.category === selectedCategory)
  }, [filteredItems, selectedCategory])

  if (filteredNotes.length === 0) {
          </
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-muted-foreground">
            Nenhum item encontrado para o período selecionado.
          </h3>
          <p className="text-sm text-muted-foreground">
            Ajuste o filtro de período para visualizar seus dados.
          </p>
        </div>
            
    )
   

  const renderCustomLabel = (entry: { name: string; value: number; percent: number }) => {
    return `${(entry.percent * 100).toFixed(1)}%`
   

  return (
    <div className="space-y-8">
           
        <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
        <p className="text-muted-foreground">Análise de gastos por categoria</p>
      </div>

      {selectedCategory && (
        <div className="flex items-center gap-2 bg-muted/50 px-4 py-3 rounded-lg">
          <span className="text-sm text-muted-foreground">
            Todas as Categorias
          </span>
          <span className="text-sm text-muted-foreground">&gt;</span>
          <span className="text-sm font-medium">{selectedCategory}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
                  x="50%"
          >
                  dominantBaseline
            Limpar Filtro
          </Button>
        </div>
        

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
            <CardTitle>Gasto por Subcat
            <CardTitle className="text-sm font-medium text-muted-foreground">
            <ResponsiveContain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{kpis.categoriesCount}</div>


































































































































































































































