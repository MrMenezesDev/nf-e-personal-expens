import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Note } from '@/lib/types'
import { formatCurrency, parseMonthFromDate } from '@/lib/formatters'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface OverviewPageProps {
  notes: Note[]
}

export function OverviewPage({ notes }: OverviewPageProps) {
  const stats = useMemo(() => {
    const total = notes.reduce((sum, note) => sum + note.total_amount, 0)
    const count = notes.length
    const average = count > 0 ? total / count : 0
    const totalItems = notes.reduce((sum, note) => sum + note.items.length, 0)

    return { total, count, average, totalItems }
  }, [notes])

  const topMerchants = useMemo(() => {
    const merchantTotals = new Map<string, number>()
    
    notes.forEach(note => {
      const current = merchantTotals.get(note.merchant_name) || 0
      merchantTotals.set(note.merchant_name, current + note.total_amount)
    })
    
    return Array.from(merchantTotals.entries())
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [notes])

  const monthlySpending = useMemo(() => {
    const monthTotals = new Map<string, number>()
    
    notes.forEach(note => {
      const month = parseMonthFromDate(note.issued_date)
      const current = monthTotals.get(month) || 0
      monthTotals.set(month, current + note.total_amount)
    })
    
    return Array.from(monthTotals.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [notes])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Your expense analytics at a glance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-primary">{formatCurrency(stats.total)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Number of Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-accent">{formatCurrency(stats.average)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.totalItems}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Merchants by Spending</CardTitle>
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
          <CardTitle>Monthly Spending Trend</CardTitle>
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
