import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Note, NoteItem } from '@/lib/types'
import { formatCurrency, parseMonthFromDate, formatDate } from '@/lib/formatters'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
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
}

const CHART_COLORS = [
  'oklch(0.45 0.12 200)',
  'oklch(0.72 0.15 75)',
  'oklch(0.55 0.22 25)',
  'oklch(0.75 0.08 150)',
  'oklch(0.65 0.18 280)',
  'oklch(0.70 0.16 50)',
  'oklch(0.60 0.14 180)',
  'oklch(0.50 0.10 320)',
  'oklch(0.68 0.12 120)',
  'oklch(0.58 0.16 240)',
]

interface ItemWithNote extends NoteItem {
  issued_date: string
  merchant_name: string
}

export function CategoriesPage({ notes }: CategoriesPageProps) {
  const { filter } = usePeriodFilter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredNotes = useMemo(() => {
    return filterNotesByPeriod(notes, filter.startDate, filter.endDate)
  }, [notes, filter])

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
    })
    return items
  }, [filteredNotes])

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
    })

    return {
      categoriesCount: categories.size,
      subcategoriesCount: subcategories.size,
      categorizedCount,
      uncategorizedCount
    }
  }, [allItems])

  const categorySpending = useMemo(() => {
    const categoryTotals = new Map<string, number>()

    filteredItems.forEach(item => {
      const category = item.category || 'Sem Categoria'
      const current = categoryTotals.get(category) || 0
      categoryTotals.set(category, current + item.line_total)
    })

    const data = Array.from(categoryTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const total = data.reduce((sum, item) => sum + item.value, 0)

    return { data, total }
  }, [filteredItems])

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
      .slice(0, 15)
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
        return entry
      })

    return { data, categories }
  }, [filteredItems])

  const itemsForCategory = useMemo(() => {
    if (!selectedCategory) return []
    return filteredItems.filter(item => item.category === selectedCategory)
  }, [filteredItems, selectedCategory])

  if (filteredNotes.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-muted-foreground">
            Nenhum item encontrado para o período selecionado.
          </h3>
          <p className="text-sm text-muted-foreground">
            Ajuste o filtro de período para visualizar seus dados.
          </p>
        </div>
      </div>
    )
  }

  const renderCustomLabel = (entry: { name: string; value: number; percent: number }) => {
    return `${(entry.percent * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-8">
      <div>
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
            className="ml-auto"
          >
            <X className="mr-1" />
            Limpar Filtro
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorias Macro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{kpis.categoriesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subcategorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{kpis.subcategoriesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens Categorizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-success">
              {kpis.categorizedCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sem Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-muted-foreground">
              {kpis.uncategorizedCount}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gasto por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categorySpending.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  label={renderCustomLabel}
                  labelLine={false}
                  onClick={(entry) => {
                    if (entry.name !== 'Sem Categoria') {
                      setSelectedCategory(entry.name)
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {categorySpending.data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      opacity={selectedCategory && selectedCategory !== entry.name ? 0.3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.88 0.01 250)',
                    borderRadius: '8px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value, entry: any) => {
                    const percentage = ((entry.payload.value / categorySpending.total) * 100).toFixed(1)
                    return `${value}: ${formatCurrency(entry.payload.value)} (${percentage}%)`
                  }}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground font-bold text-xl"
                >
                  {formatCurrency(categorySpending.total)}
                </text>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gasto por Subcategoria (Top 15)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={subcategorySpending} 
                layout="vertical" 
                margin={{ left: 150, right: 20, top: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 250)" />
                <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={140} 
                  style={{ fontSize: '12px' }} 
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'oklch(1 0 0)',
                    border: '1px solid oklch(0.88 0.01 250)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="oklch(0.72 0.15 75)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart 
              data={categoryOverTime.data} 
              margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 250)" />
              <XAxis dataKey="month" style={{ fontSize: '12px' }} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'oklch(1 0 0)',
                  border: '1px solid oklch(0.88 0.01 250)',
                  borderRadius: '8px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              {categoryOverTime.categories.map((category, index) => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stackId="1"
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {selectedCategory && itemsForCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens - {selectedCategory}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Subcategoria</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Estabelecimento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsForCategory.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="max-w-xs truncate">
                        {item.description}
                      </TableCell>
                      <TableCell>{item.subcategory || '-'}</TableCell>
                      <TableCell className="text-right font-mono">
                        {item.qty.toFixed(3)} {item.unit}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatCurrency(item.line_total)}
                      </TableCell>
                      <TableCell>{formatDate(item.issued_date)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.merchant_name}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
