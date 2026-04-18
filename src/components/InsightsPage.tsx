import { SparkData } from '@/lib/types'
import { formatCurrency } from '@/lib/formatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts'
import { Receipt, TrendUp, Warning, Coins } from '@phosphor-icons/react'

interface InsightsPageProps {
  data: SparkData
}

export function InsightsPage({ data }: InsightsPageProps) {
  const { summary, monthly_summaries } = data

  const necessityData = [
    { name: 'Essencial', value: summary.necessity_totals.Essencial, color: 'oklch(0.75 0.08 150)' },
    { name: 'Conveniência', value: summary.necessity_totals.Conveniência, color: 'oklch(0.828 0.189 84.429)' },
    { name: 'Supérfluo', value: summary.necessity_totals.Supérfluo, color: 'oklch(0.577 0.245 27.325)' }
  ].filter(item => item.value > 0)

  const categoryData = summary.category_totals.slice(0, 8).map(cat => ({
    name: cat.category,
    value: cat.total,
    items: cat.item_count
  }))

  const topMerchants = summary.merchant_totals.slice(0, 5)

  const sortedMonthly = [...monthly_summaries].sort((a, b) => b.month.localeCompare(a.month))

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return `${months[parseInt(month) - 1]} ${year}`
  }

  const totalNecessity = necessityData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="text-primary" size={20} />
              Total Gasto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total_spent)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="text-primary" size={20} />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.avg_ticket)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              mediana: {formatCurrency(summary.median_ticket)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Warning className="text-destructive" size={20} />
              Notas Atípicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{summary.outlier_count}</div>
              {summary.outlier_count > 0 && (
                <Badge variant="destructive" className="text-xs">!</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendUp className="text-success" size={20} />
              Economia Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.total_savings_opportunity > 0 ? 'text-success' : ''}`}>
              {formatCurrency(summary.total_savings_opportunity)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos por Necessidade</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={necessityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(entry) => {
                  const percent = ((entry.value / totalNecessity) * 100).toFixed(1)
                  return `${entry.name}: ${percent}%`
                }}
              >
                {necessityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 8 Categorias por Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={categoryData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  if (name === 'value') {
                    return [formatCurrency(value), `Total`]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => {
                  const item = categoryData.find(d => d.name === label)
                  return `${label} (${item?.items} itens)`
                }}
                contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="value" fill="var(--primary)" name="Valor Gasto" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Lojas por Gasto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMerchants.map((merchant, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">{merchant.merchant_name}</div>
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(merchant.total)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {merchant.note_count} {merchant.note_count === 1 ? 'nota' : 'notas'}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">#{index + 1}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumos Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedMonthly.map((month, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{formatMonth(month.month)}</div>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total:</span>{' '}
                          <span className="font-semibold">{formatCurrency(month.total_spend)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Notas:</span>{' '}
                          <span className="font-semibold">{month.note_count}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 mt-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Categoria principal:</span>{' '}
                          <span className="font-semibold">{month.top_category}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Loja principal:</span>{' '}
                          <span className="font-semibold">{month.top_merchant}</span>
                        </div>
                      </div>
                      {month.llm_insight && (
                        <div className="mt-3 flex gap-2">
                          <span className="text-lg">🤖</span>
                          <p className="text-sm italic text-muted-foreground flex-1">{month.llm_insight}</p>
                        </div>
                      )}
                    </div>
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
