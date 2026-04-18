import { useMemo, useState } from 'react'
import { Note, NoteItem } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
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
import { formatCurrency, formatDate, parseMonthFromDate } from '@/lib/formatters'

const CHART_COLORS = [
  'oklch(0.45 0.12 200)',
  'oklch(0.58 0.16 240)',
  'oklch(0.72 0.15 75)',
  'oklch(0.65 0.18 140)',
  'oklch(0.55 0.22 25)',
  'oklch(0.68 0.14 290)',
  'oklch(0.75 0.12 50)',
  'oklch(0.50 0.20 340)',
]

interface ItemWithMerchant extends NoteItem {
  issued_date: string
  merchant_name: string
}

interface CategoriesPageProps {
  notes: Note[]
}

export function CategoriesPage({ notes }: CategoriesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { filter } = usePeriodFilter()
  const filteredNotes = useMemo(() => filterNotesByPeriod(notes, filter.startDate, filter.endDate), [notes, filter])

  const allItems = useMemo(() => {
    const items: ItemWithMerchant[] = []
    filteredNotes.forEach(note => {
      note.items.forEach(item => {
        items.push({
          ...item,
          issued_date: note.issued_date,
          merchant_name: note.merchant_name,
        })
      })
    })
    return items
  }, [filteredNotes])

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return allItems
    return allItems.filter(item => (item.category || 'Sem Categoria') === selectedCategory)
  }, [allItems, selectedCategory])

  const kpis = useMemo(() => {
    const categories = new Set<string>()
    const subcategories = new Set<string>()
    let categorizedCount = 0
    let uncategorizedCount = 0

    allItems.forEach(item => {
      if (item.category) {
        categories.add(item.category)
        categorizedCount++
      } else {
        uncategorizedCount++
      }

      if (item.subcategory && item.subcategory.trim() !== '') {
        subcategories.add(item.subcategory)
      }
    })

    return {
      categoriesCount: categories.size,
      subcategoriesCount: subcategories.size,
      categorizedCount,
      uncategorizedCount,
    }
  }, [allItems])

  const categorySpending = useMemo(() => {
    const categoryTotals = new Map<string, number>()
    filteredNotes.forEach(note => {
      note.items.forEach(item => {
        const category = item.category || 'Sem Categoria'
        categoryTotals.set(category, (categoryTotals.get(category) || 0) + item.line_total)
      })
    })

    const data = Array.from(categoryTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const total = data.reduce((sum, item) => sum + item.value, 0)

    return { data, total }
  }, [filteredNotes])

  const subcategorySpending = useMemo(() => {
    const subcategoryTotals = new Map<string, number>()
    filteredItems.forEach(item => {
      const subcategory = item.subcategory || 'Sem Subcategoria'
      subcategoryTotals.set(subcategory, (subcategoryTotals.get(subcategory) || 0) + item.line_total)
    })

    return Array.from(subcategoryTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredItems])

  const categoryOverTime = useMemo(() => {
    const monthCategoryMap = new Map<string, Map<string, number>>()

    filteredNotes.forEach(note => {
      note.items.forEach(item => {
        const month = parseMonthFromDate(note.issued_date)
        const category = item.category || 'Sem Categoria'

        if (!monthCategoryMap.has(month)) {
          monthCategoryMap.set(month, new Map())
        }
        const categoryMap = monthCategoryMap.get(month)!
        categoryMap.set(category, (categoryMap.get(category) || 0) + item.line_total)
      })
    })

    const allCategories = new Set<string>()
    monthCategoryMap.forEach(categoryMap => {
      categoryMap.forEach((_, category) => allCategories.add(category))
    })

    const data = Array.from(monthCategoryMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, categoryMap]) => {
        const entry: { month: string; [key: string]: string | number } = { month }
        allCategories.forEach(category => {
          entry[category] = categoryMap.get(category) || 0
        })
        return entry
      })

    return {
      data,
      categories: Array.from(allCategories)
    }
  }, [filteredNotes])

  const itemsForCategory = useMemo(() => {
    if (!selectedCategory) return []
    return filteredItems.filter(item => (item.category || 'Sem Categoria') === selectedCategory)
  }, [filteredItems, selectedCategory])

  const renderCustomLabel = (entry: { name: string; value: number; percent: number }) => {
    const percent = entry.percent * 100
    if (percent < 5) return null
    return `${percent.toFixed(0)}%`
  }

  return (
    <div className="space-y-6">
      {selectedCategory && (
        <div className="flex items-center gap-2 bg-muted p-4 rounded-lg">
          <span className="text-sm text-muted-foreground">Filtrando por categoria:</span>
          <span className="font-semibold">{selectedCategory}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="ml-auto"
          >
            <X />
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorias Únicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{kpis.categoriesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subcategorias Únicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{kpis.subcategoriesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens Categorizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{kpis.categorizedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens Não Categorizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{kpis.uncategorizedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gasto por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySpending.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={renderCustomLabel}
                  onClick={(data) => setSelectedCategory(data.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {categorySpending.data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-2">
              {categorySpending.data.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-muted-foreground">
                      {((item.value / categorySpending.total) * 100).toFixed(1)}%
                    </span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gasto por Subcategoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {subcategorySpending.map((item, index) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(item.value / subcategorySpending[0].value) * 100}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {categoryOverTime.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categorias ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={categoryOverTime.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                {categoryOverTime.categories.map((category, index) => (
                  <Area
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stackId="1"
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {selectedCategory && itemsForCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens em {selectedCategory}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Estabelecimento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Subcategoria</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Valor Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsForCategory.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-sm">
                      {formatDate(item.issued_date)}
                    </TableCell>
                    <TableCell className="text-sm">{item.merchant_name}</TableCell>
                    <TableCell className="text-sm">{item.description}</TableCell>
                    <TableCell className="text-sm">{item.subcategory || '-'}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {item.qty} {item.unit}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-sm">
                      {formatCurrency(item.line_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
