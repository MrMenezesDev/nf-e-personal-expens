import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SparkData, Note } from '@/lib/types'
import { formatCurrency } from '@/lib/formatters'
import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
import { filterNotesByPeriod } from '@/lib/utils'
import { 
  CurrencyCircleDollar, 
  Receipt, 
  Warning, 
  PiggyBank,
  Storefront,
  Robot
} from '@phosphor-icons/react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis } from 'recharts'

interface Props {
  data: SparkData
}

export function NewInsightsPage({ data }: Props) {
  const { filter } = usePeriodFilter()
  
  const filteredNotes = useMemo(() => 
    filterNotesByPeriod(data.notes, filter.startDate, filter.endDate),
    [data.notes, filter.startDate, filter.endDate]
  )

  const computedSummary = useMemo(() => {
    const totalSpent = filteredNotes.reduce((sum, note) => sum + note.total_amount, 0)
    const outliers = filteredNotes.filter(n => n.is_outlier).length
    const savingsOpp = filteredNotes.reduce((sum, note) => sum + (note.savings_opportunity || 0), 0)
    
    const sortedAmounts = [...filteredNotes].map(n => n.total_amount).sort((a, b) => a - b)
    const medianTicket = sortedAmounts.length > 0 
      ? sortedAmounts[Math.floor(sortedAmounts.length / 2)]
      : 0
    const avgTicket = filteredNotes.length > 0 ? totalSpent / filteredNotes.length : 0

    const necessityTotals = { Essencial: 0, Conveniência: 0, Supérfluo: 0, 'Não classificado': 0 }
    filteredNotes.forEach(note => {
      note.items.forEach(item => {
        const necessity = item.necessity || 'Não classificado'
        if (necessity in necessityTotals) {
          necessityTotals[necessity as keyof typeof necessityTotals] += item.line_total
        } else {
          necessityTotals['Não classificado'] += item.line_total
        }
      })
    })

    const categoryMap = new Map<string, { total: number, count: number }>()
    filteredNotes.forEach(note => {
      note.items.forEach(item => {
        const cat = item.category || 'Sem categoria'
        const existing = categoryMap.get(cat) || { total: 0, count: 0 }
        categoryMap.set(cat, {
          total: existing.total + item.line_total,
          count: existing.count + 1
        })
      })
    })
    const categoryTotals = Array.from(categoryMap.entries())
      .map(([category, data]) => ({ category, total: data.total, item_count: data.count }))
      .sort((a, b) => b.total - a.total)

    const merchantMap = new Map<string, { total: number, count: number }>()
    filteredNotes.forEach(note => {
      const existing = merchantMap.get(note.merchant_name) || { total: 0, count: 0 }
      merchantMap.set(note.merchant_name, {
        total: existing.total + note.total_amount,
        count: existing.count + 1
      })
    })
    const merchantTotals = Array.from(merchantMap.entries())
      .map(([merchant_name, data]) => ({ merchant_name, total: data.total, note_count: data.count }))
      .sort((a, b) => b.total - a.total)

    return {
      total_notes: filteredNotes.length,
      total_spent: totalSpent,
      avg_ticket: avgTicket,
      median_ticket: medianTicket,
      outlier_count: outliers,
      total_savings_opportunity: savingsOpp,
      necessity_totals: necessityTotals,
      category_totals: categoryTotals,
      merchant_totals: merchantTotals
    }
  }, [filteredNotes])

  const topSavingsItems = useMemo(() => {
    if (!data.top_savings_items) return []
    
    const itemMap = new Map<string, {
      description: string
      ean: string
      category: string
      min_price: number
      max_price: number
      total_overpaid: number
      occurrences: number
    }>()

    filteredNotes.forEach(note => {
      note.items.forEach(item => {
        if (item.min_price_seen && item.price_rank && item.price_rank > 1) {
          const key = `${item.ean}_${item.description_norm}`
          const overpaid = item.line_total - (item.min_price_seen * item.qty)
          
          const existing = itemMap.get(key)
          if (existing) {
            existing.total_overpaid += overpaid
            existing.occurrences += 1
            existing.min_price = Math.min(existing.min_price, item.min_price_seen)
            existing.max_price = Math.max(existing.max_price, item.unit_price)
          } else {
            itemMap.set(key, {
              description: item.description,
              ean: item.ean,
              category: item.category || 'Sem categoria',
              min_price: item.min_price_seen,
              max_price: item.unit_price,
              total_overpaid: overpaid,
              occurrences: 1
            })
          }
        }
      })
    })

    return Array.from(itemMap.values())
      .sort((a, b) => b.total_overpaid - a.total_overpaid)
      .slice(0, 10)
  }, [filteredNotes, data.top_savings_items])

  const monthlySummaries = useMemo(() => {
    if (!data.monthly_summaries) return []
    
    const monthSet = new Set<string>()
    filteredNotes.forEach(note => {
      const month = note.issued_date.substring(0, 7)
      monthSet.add(month)
    })

    return data.monthly_summaries
      .filter(ms => monthSet.has(ms.month))
      .sort((a, b) => b.month.localeCompare(a.month))
  }, [filteredNotes, data.monthly_summaries])

  const necessityChartData = useMemo(() => {
    return [
      { name: 'Essencial', value: computedSummary.necessity_totals.Essencial, color: 'oklch(0.75 0.08 150)' },
      { name: 'Conveniência', value: computedSummary.necessity_totals.Conveniência, color: 'oklch(0.72 0.15 75)' },
      { name: 'Supérfluo', value: computedSummary.necessity_totals.Supérfluo, color: 'oklch(0.55 0.22 25)' }
    ].filter(d => d.value > 0)
  }, [computedSummary.necessity_totals])

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return `${months[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CurrencyCircleDollar className="text-primary" />
              Total Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(computedSummary.total_spent)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="text-primary" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(computedSummary.avg_ticket)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              mediana: {formatCurrency(computedSummary.median_ticket)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Warning className="text-destructive" />
              Compras Atípicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {computedSummary.outlier_count}
              {computedSummary.outlier_count > 0 && (
                <Badge variant="destructive">{computedSummary.outlier_count}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PiggyBank className="text-success" />
              Economia Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(computedSummary.total_savings_opportunity)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              se comprasse sempre no menor preço
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Essencial vs Conveniência vs Supérfluo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={necessityChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {necessityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {necessityChartData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 8 Categorias por Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={computedSummary.category_totals.slice(0, 8)}
                layout="vertical"
                margin={{ left: 100, right: 20 }}
              >
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                <YAxis type="category" dataKey="category" width={90} />
                <Tooltip 
                  formatter={(value: number, name, props) => [
                    `${formatCurrency(value)} (${props.payload.item_count} itens)`,
                    ''
                  ]}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Storefront />
            Top 5 Lojas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            {computedSummary.merchant_totals.slice(0, 5).map((merchant, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{merchant.merchant_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{formatCurrency(merchant.total)}</div>
                  <p className="text-xs text-muted-foreground">{merchant.note_count} notas</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {topSavingsItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>O que você mais pagou a mais</CardTitle>
            <CardDescription>
              Se você sempre comprasse ao menor preço, teria economizado {formatCurrency(topSavingsItems.reduce((sum, item) => sum + item.total_overpaid, 0))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Produto</th>
                    <th className="text-left py-2 px-4">Categoria</th>
                    <th className="text-right py-2 px-4">Preço Mínimo</th>
                    <th className="text-right py-2 px-4">Preço Máximo</th>
                    <th className="text-right py-2 px-4">Total Pago Acima</th>
                  </tr>
                </thead>
                <tbody>
                  {topSavingsItems.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{item.description}</td>
                      <td className="py-2 px-4">{item.category}</td>
                      <td className="text-right py-2 px-4">{formatCurrency(item.min_price)}</td>
                      <td className="text-right py-2 px-4">{formatCurrency(item.max_price)}</td>
                      <td className="text-right py-2 px-4 font-bold text-destructive">
                        {formatCurrency(item.total_overpaid)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resumos Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlySummaries.map((ms, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{formatMonth(ms.month)}</CardTitle>
                      <CardDescription>
                        {formatCurrency(ms.total_spend)} • {ms.note_count} notas
                      </CardDescription>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Top categoria: {ms.top_category}</div>
                      <div>Top loja: {ms.top_merchant}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 italic text-sm text-muted-foreground">
                    <Robot className="mt-0.5 flex-shrink-0" size={16} />
                    <span>{ms.llm_insight || 'Análise não disponível'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
