import { useState, useMemo } from 'react'
import { Note, NoteItem } from '@/lib/types'
import { formatCurrency, formatDate, parseMonthFromDate } from '@/lib/formatters'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MagnifyingGlass, CaretUp, CaretDown } from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
import { filterNotesByPeriod, matchesCategoryFilter } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ItemsPageProps {
  notes: Note[]
}

interface ItemOccurrence {
  item: NoteItem
  note: Note
}

type SortField = 'date' | 'description' | 'category' | 'subcategory' | 'unit_price' | 'qty' | 'line_total'
type SortDirection = 'asc' | 'desc'

const CHART_COLORS = [
  'oklch(0.45 0.12 200)',
  'oklch(0.72 0.15 75)',
  'oklch(0.55 0.22 25)',
  'oklch(0.35 0.02 250)',
  'oklch(0.75 0.08 150)',
]

export function ItemsPage({ notes }: ItemsPageProps) {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const { filter, setFilter } = usePeriodFilter()

  const filteredNotes = useMemo(() => {
    return filterNotesByPeriod(notes, filter.startDate, filter.endDate)
  }, [notes, filter])

  const hasCategoryFilter = filter.category !== 'Todas' || filter.subcategory !== 'Todas'

  const searchResults = useMemo(() => {
    const hasSearch = search && search.trim().length >= 2
    
    if (!hasSearch && !hasCategoryFilter) return []

    const searchLower = search.toLowerCase()
    const occurrences: ItemOccurrence[] = []

    filteredNotes.forEach(note => {
      note.items.forEach(item => {
        const matchesSearch = !hasSearch || item.description_norm.toLowerCase().includes(searchLower)
        const matchesCategory = matchesCategoryFilter(item, filter.category, filter.subcategory)
        
        if (matchesSearch && matchesCategory) {
          occurrences.push({ item, note })
        }
      })
    })

    return occurrences.sort((a, b) => {
      let aVal: any, bVal: any

      switch (sortField) {
        case 'date':
          aVal = a.note.issued_date
          bVal = b.note.issued_date
          break
        case 'description':
          aVal = a.item.description_norm.toLowerCase()
          bVal = b.item.description_norm.toLowerCase()
          break
        case 'category':
          aVal = a.item.category || ''
          bVal = b.item.category || ''
          break
        case 'subcategory':
          aVal = a.item.subcategory || ''
          bVal = b.item.subcategory || ''
          break
        case 'unit_price':
          aVal = a.item.unit_price
          bVal = b.item.unit_price
          break
        case 'qty':
          aVal = a.item.qty
          bVal = b.item.qty
          break
        case 'line_total':
          aVal = a.item.line_total
          bVal = b.item.line_total
          break
        default:
          aVal = a.note.issued_date
          bVal = b.note.issued_date
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredNotes, search, filter.category, filter.subcategory, sortField, sortDirection, hasCategoryFilter])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleCategoryClick = (category: string, subcategory?: string) => {
    if (subcategory) {
      setFilter({ ...filter, category, subcategory })
    } else {
      setFilter({ ...filter, category, subcategory: 'Todas' })
    }
  }

  const priceStats = useMemo(() => {
    if (searchResults.length === 0) return null

    const prices = searchResults.map(r => r.item.unit_price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length

    return { min, max, avg, count: searchResults.length }
  }, [searchResults])

  const priceChartData = useMemo(() => {
    const hasSearch = search && search.trim().length >= 2

    if (hasSearch) {
      return searchResults.map(r => ({
        date: formatDate(r.note.issued_date),
        price: r.item.unit_price,
        fullDate: r.note.issued_date
      }))
    } else {
      const monthlyData = new Map<string, Map<string, { total: number, count: number }>>()
      
      searchResults.forEach(r => {
        const month = parseMonthFromDate(r.note.issued_date)
        const subcategory = r.item.subcategory || 'Sem Categoria'
        
        if (!monthlyData.has(month)) {
          monthlyData.set(month, new Map())
        }
        
        const monthMap = monthlyData.get(month)!
        if (!monthMap.has(subcategory)) {
          monthMap.set(subcategory, { total: 0, count: 0 })
        }
        
        const subcatData = monthMap.get(subcategory)!
        subcatData.total += r.item.unit_price
        subcatData.count += 1
      })

      const subcategoryTotals = new Map<string, number>()
      searchResults.forEach(r => {
        const subcategory = r.item.subcategory || 'Sem Categoria'
        subcategoryTotals.set(subcategory, (subcategoryTotals.get(subcategory) || 0) + r.item.line_total)
      })

      const topSubcategories = Array.from(subcategoryTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([subcat]) => subcat)

      const chartData: any[] = []
      const sortedMonths = Array.from(monthlyData.keys()).sort()
      
      sortedMonths.forEach(month => {
        const monthMap = monthlyData.get(month)!
        const dataPoint: any = { month }
        
        topSubcategories.forEach(subcat => {
          if (monthMap.has(subcat)) {
            const data = monthMap.get(subcat)!
            dataPoint[subcat] = data.total / data.count
          } else {
            dataPoint[subcat] = null
          }
        })
        
        chartData.push(dataPoint)
      })

      return { chartData, subcategories: topSubcategories }
    }
  }, [searchResults, search])

  const hasSearch = search && search.trim().length >= 2
  const showEmptyState = !hasSearch && !hasCategoryFilter
  const showMinLengthWarning = hasSearch && search.trim().length < 2
  const showNoResults = (hasSearch || hasCategoryFilter) && searchResults.length === 0

  const getFilterMessage = () => {
    if (filter.subcategory !== 'Todas') {
      return `Exibindo itens da subcategoria: ${filter.subcategory}`
    }
    if (filter.category !== 'Todas') {
      return `Exibindo itens da categoria: ${filter.category}`
    }
    return null
  }

  const SortableHeader = ({ field, children, className }: { field: SortField, children: React.ReactNode, className?: string }) => (
    <TableHead 
      onClick={() => handleSort(field)} 
      className={cn('cursor-pointer hover:bg-muted/50 select-none', className)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <CaretUp size={14} weight="fill" /> : <CaretDown size={14} weight="fill" />
        )}
      </div>
    </TableHead>
  )

  const filterMessage = getFilterMessage()
  const chartTitle = hasSearch 
    ? `Evolução de Preço: ${search}` 
    : 'Evolução de Preço Médio por Subcategoria'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Itens e Preços</h1>
        <p className="text-muted-foreground">Acompanhe o histórico de preços de produtos específicos</p>
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por produto (ex: 'ovos', 'leite')..."
          className="pl-10"
          id="search-items"
        />
      </div>

      {filterMessage && (
        <div className="bg-accent/20 border border-accent/30 rounded-lg px-4 py-3">
          <p className="text-sm font-medium text-accent-foreground">
            {filterMessage}
          </p>
        </div>
      )}

      {showEmptyState && (
        <div className="text-center py-12 text-muted-foreground">
          Digite o nome de um produto para pesquisar
        </div>
      )}

      {showMinLengthWarning && (
        <div className="text-center py-12 text-muted-foreground">
          Digite pelo menos 2 caracteres para buscar
        </div>
      )}

      {showNoResults && (
        <div className="text-center py-12 text-muted-foreground">
          {hasSearch 
            ? `Nenhum item encontrado com "${search}" no período selecionado`
            : 'Nenhum item encontrado com os filtros selecionados'
          }
        </div>
      )}

      {searchResults.length > 0 && priceStats && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Preço Mínimo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-success">{formatCurrency(priceStats.min)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Preço Máximo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-destructive">{formatCurrency(priceStats.max)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Preço Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-primary">{formatCurrency(priceStats.avg)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ocorrências</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{priceStats.count}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{chartTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              {hasSearch ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceChartData as any[]} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 250)" />
                    <XAxis 
                      dataKey="date" 
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)', 
                        border: '1px solid oklch(0.88 0.01 250)',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="oklch(0.45 0.12 200)" 
                      strokeWidth={2}
                      dot={{ fill: 'oklch(0.45 0.12 200)', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart 
                    data={(priceChartData as any).chartData} 
                    margin={{ left: 20, right: 20, top: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 250)" />
                    <XAxis 
                      dataKey="month" 
                      style={{ fontSize: '11px' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'oklch(1 0 0)', 
                        border: '1px solid oklch(0.88 0.01 250)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    {(priceChartData as any).subcategories.map((subcat: string, idx: number) => (
                      <Line 
                        key={subcat}
                        type="monotone" 
                        dataKey={subcat} 
                        stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Todas as Ocorrências ({searchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableHeader field="date">Data</SortableHeader>
                      <SortableHeader field="description">Descrição</SortableHeader>
                      <SortableHeader field="category" className="hidden lg:table-cell">Categoria</SortableHeader>
                      <SortableHeader field="subcategory" className="hidden lg:table-cell">Subcategoria</SortableHeader>
                      <TableHead className="hidden md:table-cell">Estabelecimento</TableHead>
                      <SortableHeader field="unit_price" className="text-right">Preço Unit.</SortableHeader>
                      <SortableHeader field="qty" className="text-right">Qtd</SortableHeader>
                      <SortableHeader field="line_total" className="text-right">Total</SortableHeader>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((result, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(result.note.issued_date)}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {result.item.description}
                        </TableCell>
                        <TableCell 
                          className="text-sm hidden lg:table-cell cursor-pointer hover:text-primary hover:underline"
                          onClick={() => handleCategoryClick(result.item.category || 'Todas')}
                        >
                          {result.item.category || '-'}
                        </TableCell>
                        <TableCell 
                          className="text-sm hidden lg:table-cell cursor-pointer hover:text-primary hover:underline"
                          onClick={() => handleCategoryClick(result.item.category || 'Todas', result.item.subcategory || 'Todas')}
                        >
                          {result.item.subcategory || '-'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                          {result.note.merchant_name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">
                          {formatCurrency(result.item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {result.item.qty} {result.item.unit}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(result.item.line_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
