import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Note } from '@/lib/types'
import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
import { CalendarDots, Clock, Receipt } from '@phosphor-icons/react'
import { filterNotesByPeriod, filterNotesByCategory } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'

interface ConsumptionPatternPageProps {
  notes: Note[]
}

export function ConsumptionPatternsPage({ notes }: ConsumptionPatternPageProps) {
  const { filter } = usePeriodFilter()

  const filteredNotes = useMemo(() => {
    let filtered = filterNotesByPeriod(notes, filter.startDate, filter.endDate)
    filtered = filterNotesByCategory(filtered, filter.category, filter.subcategory)
    return filtered
  }, [notes, filter])

  const dayOfWeekTotals = useMemo(() => {
    const dayOrder = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    const dayMap = new Map<string, number>()

    filteredNotes.forEach(note => {
      const day = note.day_of_week || 'Desconhecido'
      const existing = dayMap.get(day) || 0
      dayMap.set(day, existing + note.total_amount)
    })

    return dayOrder
      .map(day => ({
        day,
        total: dayMap.get(day) || 0
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
      .map(([hour, total]) => ({
        hour,
        label: `${hour.toString().padStart(2, '0')}:00`,
        total
      }))
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
            <p className="text-sm text-muted-foreground">compras/mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dias da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dayOfWeekTotals.map(day => (
                <div key={day.day} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{day.day}</span>
                    <span className="text-muted-foreground">{formatCurrency(day.total)}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(day.total / maxDayTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Horários do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {hourOfDayTotals.slice(0, 10).map(hour => (
                <div key={hour.hour} className="flex justify-between text-sm">
                  <span className="font-medium">{hour.label}</span>
                  <span className="text-muted-foreground">{formatCurrency(hour.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compras Acima da Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Loja</th>
                    <th className="text-right py-2 px-4">% Acima da Média</th>
                  </tr>
                </thead>
                <tbody>
                  {aboveAvgNotes.slice(0, 10).map((note, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-4">{note.merchant_name}</td>
                      <td className="text-right py-2 px-4">
                        <Badge variant="destructive">
                          +{(note.spending_vs_avg_pct || 0).toFixed(0)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compras Abaixo da Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Loja</th>
                    <th className="text-right py-2 px-4">% Abaixo da Média</th>
                  </tr>
                </thead>
                <tbody>
                  {belowAvgNotes.slice(0, 10).map((note, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2 px-4">{note.merchant_name}</td>
                      <td className="text-right py-2 px-4">
                        <Badge className="bg-success text-success-foreground">
                          {(note.spending_vs_avg_pct || 0).toFixed(0)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
