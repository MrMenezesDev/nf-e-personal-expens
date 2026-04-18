import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SparkData } from '@/lib/types'
import { formatCurrency } from '@/lib/formatters'
import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
import { filterNotesByPeriod } from '@/lib/utils'
import { TrendUp } from '@phosphor-icons/react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Props {
  data: SparkData
}

export function PersonalInflationPage({ data }: Props) {
  const { filter } = usePeriodFilter()
  
  const filteredNotes = useMemo(() => 
    filterNotesByPeriod(data.notes, filter.startDate, filter.endDate),
    [data.notes, filter.startDate, filter.endDate]
  )

  const personalInflation = useMemo(() => {
    if (!data.personal_inflation) return []
    
    const monthSet = new Set<string>()
    filteredNotes.forEach(note => {
      const month = note.issued_date.substring(0, 7)
      monthSet.add(month)
    })

    return data.personal_inflation.filter(pi => {
      const months = []
      let current = pi.first_month
      while (current <= pi.last_month) {
        months.push(current)
        const [y, m] = current.split('-').map(Number)
        const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
        current = nextMonth
        if (months.length > 100) break
      }
      return months.some(m => monthSet.has(m))
    }).sort((a, b) => b.variation_pct - a.variation_pct)
  }, [filteredNotes, data.personal_inflation])

  const topInflation = personalInflation.length > 0 ? personalInflation[0] : null

  const priceTrends = useMemo(() => {
    if (!data.price_trends) return []
    
    return data.price_trends
      .filter(pt => pt.variation_pct > 0)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5)
  }, [data.price_trends])

  const topPriceIncreases = useMemo(() => {
    if (!data.price_trends) return []
    
    return data.price_trends
      .filter(pt => pt.variation_pct > 0)
      .sort((a, b) => b.variation_pct - a.variation_pct)
      .slice(0, 10)
  }, [data.price_trends])

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    return `${months[parseInt(month) - 1]}/${year.substring(2)}`
  }

  const formatMonthFull = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return `${months[parseInt(month) - 1]}/${year}`
  }

  const getVariationColor = (pct: number) => {
    if (pct < 0) return 'text-success'
    if (pct > 20) return 'text-destructive'
    if (pct > 10) return 'text-destructive'
    return 'text-accent'
  }

  const getVariationBadgeVariant = (pct: number): 'default' | 'destructive' | 'secondary' => {
    if (pct < 0) return 'secondary'
    if (pct > 20) return 'destructive'
    return 'default'
  }

  const chartData = useMemo(() => {
    if (priceTrends.length === 0) return []
    
    const allMonths = new Set<string>()
    priceTrends.forEach(pt => pt.months.forEach(m => allMonths.add(m)))
    
    const sortedMonths = Array.from(allMonths).sort()
    
    return sortedMonths.map(month => {
      const dataPoint: any = { month: formatMonth(month) }
      priceTrends.forEach((pt, idx) => {
        const monthIndex = pt.months.indexOf(month)
        dataPoint[`category${idx}`] = monthIndex >= 0 ? pt.avg_prices[monthIndex] : null
      })
      return dataPoint
    })
  }, [priceTrends])

  const colors = ['oklch(0.45 0.12 200)', 'oklch(0.72 0.15 75)', 'oklch(0.55 0.22 25)', 'oklch(0.75 0.08 150)', 'oklch(0.35 0.02 250)']

  return (
    <div className="space-y-6">
      {topInflation && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp className="text-destructive" size={24} />
              Maior Variação de Preço
            </CardTitle>
            <CardDescription>
              <span className="text-lg font-bold">{topInflation.category}</span> subiu{' '}
              <span className="text-destructive font-bold">{topInflation.variation_pct.toFixed(1)}%</span>{' '}
              desde {formatMonthFull(topInflation.first_month)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Preço médio (início)</p>
                <p className="text-xl font-bold">{formatCurrency(topInflation.first_avg_price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preço médio (atual)</p>
                <p className="text-xl font-bold">{formatCurrency(topInflation.last_avg_price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Meses com dados</p>
                <p className="text-xl font-bold">{topInflation.months_with_data}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Variação de Preço por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Categoria</th>
                  <th className="text-right py-2 px-4">Preço Médio (Início)</th>
                  <th className="text-right py-2 px-4">Preço Médio (Atual)</th>
                  <th className="text-right py-2 px-4">Variação %</th>
                  <th className="text-left py-2 px-4">Período</th>
                </tr>
              </thead>
              <tbody>
                {personalInflation.map((pi, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-4 font-medium">{pi.category}</td>
                    <td className="text-right py-2 px-4">{formatCurrency(pi.first_avg_price)}</td>
                    <td className="text-right py-2 px-4">{formatCurrency(pi.last_avg_price)}</td>
                    <td className="text-right py-2 px-4">
                      <Badge variant={getVariationBadgeVariant(pi.variation_pct)}>
                        {pi.variation_pct > 0 ? '+' : ''}{pi.variation_pct.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="py-2 px-4 text-sm text-muted-foreground">
                      {formatMonth(pi.first_month)} → {formatMonth(pi.last_month)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Preço Médio por Categoria</CardTitle>
            <CardDescription>Top 5 categorias por número de ocorrências</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                {priceTrends.map((pt, idx) => (
                  <Line
                    key={idx}
                    type="monotone"
                    dataKey={`category${idx}`}
                    stroke={colors[idx]}
                    name={pt.category}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {priceTrends.map((pt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx] }} />
                  <span className="text-sm">{pt.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {topPriceIncreases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Maior Alta de Preço</CardTitle>
            <CardDescription>Top 10 por variação percentual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Produto</th>
                    <th className="text-right py-2 px-4">Preço Inicial</th>
                    <th className="text-right py-2 px-4">Preço Atual</th>
                    <th className="text-right py-2 px-4">Variação %</th>
                    <th className="text-right py-2 px-4">Nº Ocorrências</th>
                  </tr>
                </thead>
                <tbody>
                  {topPriceIncreases.map((pt, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{pt.description}</td>
                      <td className="text-right py-2 px-4">{formatCurrency(pt.avg_prices[0])}</td>
                      <td className="text-right py-2 px-4">{formatCurrency(pt.avg_prices[pt.avg_prices.length - 1])}</td>
                      <td className="text-right py-2 px-4">
                        <Badge variant={pt.variation_pct > 20 ? 'destructive' : 'default'}>
                          +{pt.variation_pct.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-right py-2 px-4">{pt.occurrences}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center py-4">
        * Baseado nos seus dados de compra — não reflete IPCA oficial.
      </p>
    </div>
  )
}
