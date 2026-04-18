import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Note } from '@/lib/types'
import { usePeriodFilter } from '@/contexts/PeriodFilterConte
import { CalendarDots, Clock, Receipt } from '@phosphor-icons/re

  notes: Note[]


  const filteredN
    [notes, fil


    filteredNotes.forEach(note => {
      const existing = dayMap.get(day)
  
      })

    return dayOrder
   

      .filter(d => d.total > 0)

    
    filteredNotes.forEach(note => {
        hourMap.set(note.hour_of_day, (hourMap.get(n
    })
    return Array.from(h
      .sort((a, b) => a.hour - b.hour)

    if (
  }, [

    return [...hourOfDayTotals].sort((a, b) => b.total - a.total)[0]

    if (filteredNote
    const mo
      months.add(note.issued_date.substring
    
  }, [fil
  const aboveAvgNotes = useMemo
      .filter(note =>

  const belowAvgNotes = useMemo(() => {
      .filter(note => (note.spending_vs_avg_p
  },
  const maxDayTotal = Math.max(...d
  return (
      <div className="grid md:grid-cols-3 gap-4">
       
      

            </CardHeader>
              <div className="text-2xl font-bold">{topDay.day}</div
            </CardContent>
        )}

            <CardHeader classNam
                <Clock className="text-primary" /
              </CardTitle>
            <CardConten

          </Card>
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
        <Card>
            <CardTitle>Compras Acima da Média</Car
          <CardContent>
              <table cla
                  <tr c
                    <th
                    <th className="text-right py-2 px-4">% Acima da Média</th>
                </thead>
                  {above
               
            

            
                    
                </tbody>
            </div>
        </Card>

        <Card>
            <CardTitle>Compras Abaixo
          <CardContent>
              <table cl
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Loja</th>
                
                </t
                  {belowAvgNotes
                      <td className="
                      <td className="text-
                
                       
                    </tr>
                </tbod
            <

    </div>
}

































































































