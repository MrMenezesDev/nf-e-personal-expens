import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Note } from '@/lib/types'
import { formatCurrency, parseMonthFromDate } from '@/lib/formatters'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
import { filterNotesByPeriod, filterNotesByCategory, matchesCategoryFilter, getFilteredItemsTotal } from '@/lib/utils'

interface OverviewPageProps {
  notes: Note[]
}

export function OverviewPage({ notes }: OverviewPageProps) {
  const { filter } = usePeriodFilter()

  const filteredNotes = useMemo(() => {
    let filtered = filterNotesByPeriod(notes, filter.startDate, filter.endDate)
    filtered = filterNotesByCategory(filtered, filter.category, filter.subcategory)
    return filtered
  }, [notes, filter])

  const stats = useMemo(() => {
    const isCategoryFiltered = filter.category !== 'Todas' || filter.subcategory !== 'Todas'
    
    let total = 0
    let totalItems = 0
    
    filteredNotes.forEach(note => {
      total += getFilteredItemsTotal(note, filter.category, filter.subcategory)
      
      if (isCategoryFiltered) {
        totalItems += note.items.filter(item => 
          matchesCategoryFilter(item, filter.category, filter.subcategory)
        ).length
      } else {
        totalItems += note.items.length
      }
    })

    const count = filteredNotes.length
    const average = count > 0 ? total / count : 0

    return { total, count, average, totalItems }
  }, [filteredNotes, filter.category, filter.subcategory])

  const topMerchants = useMemo(() => {
    const merchantTotals = new Map<string, number>()
    
    filteredNotes.forEach(note => {
      const merchantTotal = getFilteredItemsTotal(note, filter.category, filter.subcategory)
      const current = merchantTotals.get(note.merchant_name) || 0
      merchantTotals.set(note.merchant_name, current + merchantTotal)
    })
    
    return Array.from(merchantTotals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [filteredNotes, filter.category, filter.subcategory])

  const monthlySpending = useMemo(() => {
    const monthTotals = new Map<string, number>()
    
    filteredNotes.forEach(note => {
      const month = parseMonthFromDate(note.issued_date)
      const monthTotal = getFilteredItemsTotal(note, filter.category, filter.subcategory)
      const current = monthTotals.get(month) || 0
      monthTotals.set(month, current + monthTotal)
    })
    
    return Array.from(monthTotals.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [filteredNotes, filter.category, filter.subcategory])

  if (filteredNotes.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-muted-foreground">
            Nenhuma nota encontrada para o período selecionado.
          </h3>
          <p className="text-sm text-muted-foreground">
            Ajuste o filtro de período para visualizar seus dados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
        <p className="text-muted-foreground">Análise das suas despesas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-primary">{formatCurrency(stats.total)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Nº de Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-accent">{formatCurrency(stats.average)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.totalItems}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Estabelecimentos por Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topMerchants} layout="vertical" margin={{ left: 150, right: 20, top: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 250)" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis type="category" dataKey="name" width={140} style={{ fontSize: '12px' }} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'oklch(1 0 0)', 
                  border: '1px solid oklch(0.88 0.01 250)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="total" fill="oklch(0.45 0.12 200)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gastos Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySpending} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
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
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="oklch(0.72 0.15 75)" 
                strokeWidth={3}
                dot={{ fill: 'oklch(0.72 0.15 75)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
