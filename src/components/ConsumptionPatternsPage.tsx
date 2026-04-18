import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Note } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
import { filterNotesByPeriod } from '@/lib/utils'
import { CalendarDots, Clock, Receipt } from '@phosphor-icons/react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface Props {
  notes: Note[]
}

export function ConsumptionPatternsPage({ notes }: Props) {
  const { filter } = usePeriodFilter()
  
  const filteredNotes = useMemo(() => 
    filterNotesByPeriod(notes, filter.startDate, filter.endDate),
    [notes, filter.startDate, filter.endDate]
  )

  const dayOfWeekTotals = useMemo(() => {
    const dayMap = new Map<string, { total: number, count: number }>()
    
    filteredNotes.forEach(note => {
      const day = note.day_of_week || 'Desconhecido'
      const existing = dayMap.get(day) || { total: 0, count: 0 }
      dayMap.set(day, {
        total: existing.total + note.total_amount,
        count: existing.count + 1
      })
    })

    const dayOrder = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    return dayOrder
      .map(day => ({
        day,
        total: dayMap.get(day)?.total || 0,
        note_count: dayMap.get(day)?.count || 0
      }))
      .filter(d => d.total > 0)
  }, [filteredNotes])

  const hourOfDayTotals = useMemo(() => {
    const hourMap = new Map<number, number>()
    
    filteredNotes.forEach(note => {
      if (note.hour_of_day !== undefined) {
        hourMap.set(note.hour_of_day, (hourMap.get(note.hour_of_day) || 0) + note.total_amount)
      }
    })

    return Array.from(hourMap.entries())
      .map(([hour, total]) => ({ hour, total, label: `${hour}h` }))
      .sort((a, b) => a.hour - b.hour)
  }, [filteredNotes])

  const topDay = useMemo(() => {
    if (dayOfWeekTotals.length === 0) return null
    return [...dayOfWeekTotals].sort((a, b) => b.total - a.total)[0]
  }, [dayOfWeekTotals])

  const topHour = useMemo(() => {
    if (hourOfDayTotals.length === 0) return null
    return [...hourOfDayTotals].sort((a, b) => b.total - a.total)[0]
  }, [hourOfDayTotals])

  const avgFrequency = useMemo(() => {
    if (filteredNotes.length === 0) return 0
    
    const months = new Set<string>()
    filteredNotes.forEach(note => {
      months.add(note.issued_date.substring(0, 7))
    })
    
    return filteredNotes.length / months.size
  }, [filteredNotes])

  const aboveAvgNotes = useMemo(() => {
    return filteredNotes
      .filter(note => (note.spending_vs_avg_pct || 0) > 20)
      .sort((a, b) => (b.spending_vs_avg_pct || 0) - (a.spending_vs_avg_pct || 0))
  }, [filteredNotes])

  const belowAvgNotes = useMemo(() => {
    return filteredNotes
      .filter(note => (note.spending_vs_avg_pct || 0) < -20)
      .sort((a, b) => (a.spending_vs_avg_pct || 0) - (b.spending_vs_avg_pct || 0))
  }, [filteredNotes])

  const maxDayTotal = Math.max(...dayOfWeekTotals.map(d => d.total), 0)

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {topDay && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CalendarDots className="text-primary" />
                Dia com Mais Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topDay.day}</div>
              <p className="text-sm text-muted-foreground">{formatCurrency(topDay.total)}</p>
            </CardContent>
          </Card>
        )}

        {topHour && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="text-primary" />
                Horário de Pico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topHour.label}</div>
              <p className="text-sm text-muted-foreground">{formatCurrency(topHour.total)}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="text-primary" />
              Frequência Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFrequency.toFixed(1)}</div>
            <p className="text-sm text-muted-foreground">compras por mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gasto por Dia da Semana</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dayOfWeekTotals}>
              <XAxis dataKey="day" />
              <YAxis tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Total']}
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Bar 
                dataKey="total" 
                radius={[4, 4, 0, 0]}
                fill="hsl(var(--primary))"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {hourOfDayTotals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Gasto por Horário</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourOfDayTotals}>
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Total']}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                />
                <Bar 
                  dataKey="total" 
                  radius={[4, 4, 0, 0]}
                  fill="hsl(var(--primary))"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {aboveAvgNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compras Acima da Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Data</th>
                    <th className="text-left py-2 px-4">Loja</th>
                    <th className="text-right py-2 px-4">Total</th>
                    <th className="text-right py-2 px-4">% Acima da Média</th>
                  </tr>
                </thead>
                <tbody>
                  {aboveAvgNotes.map((note, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{formatDate(note.issued_date)}</td>
                      <td className="py-2 px-4">{note.merchant_name}</td>
                      <td className="text-right py-2 px-4">{formatCurrency(note.total_amount)}</td>
                      <td className="text-right py-2 px-4">
                        <Badge variant="destructive">
                          +{note.spending_vs_avg_pct?.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {belowAvgNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compras Abaixo da Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Data</th>
                    <th className="text-left py-2 px-4">Loja</th>
                    <th className="text-right py-2 px-4">Total</th>
                    <th className="text-right py-2 px-4">% Abaixo da Média</th>
                  </tr>
                </thead>
                <tbody>
                  {belowAvgNotes.map((note, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">{formatDate(note.issued_date)}</td>
                      <td className="py-2 px-4">{note.merchant_name}</td>
                      <td className="text-right py-2 px-4">{formatCurrency(note.total_amount)}</td>
                      <td className="text-right py-2 px-4">
                        <Badge className="bg-success text-white">
                          {note.spending_vs_avg_pct?.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
