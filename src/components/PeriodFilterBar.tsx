import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/formatters'

export function PeriodFilterBar() {
  const { filter, setFilter } = usePeriodFilter()

  const handlePreset = (preset: '30days' | '90days' | 'thisyear' | 'all') => {
    const today = new Date()
    let startDate: string | null = null
    let endDate: string | null = null

    switch (preset) {
      case '30days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break
      case '90days':
        startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
        endDate = today.toISOString().split('T')[0]
        break
      case 'thisyear':
        startDate = `${today.getFullYear()}-01-01`
        endDate = today.toISOString().split('T')[0]
        break
      case 'all':
        startDate = null
        endDate = null
        break
    }

    setFilter({ startDate, endDate })
  }

  const displayPeriod = () => {
    if (!filter.startDate && !filter.endDate) {
      return 'Todos os períodos'
    }

    const start = filter.startDate ? formatDate(filter.startDate) : '...'
    const end = filter.endDate ? formatDate(filter.endDate) : '...'
    return `${start} – ${end}`
  }

  return (
    <div className="border-b bg-card sticky top-16 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Período:</span>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={filter.startDate || ''}
                onChange={(e) =>
                  setFilter({ ...filter, startDate: e.target.value || null })
                }
                className="w-40 h-9 text-sm"
                id="period-start"
              />
              <span className="text-sm text-muted-foreground">até</span>
              <Input
                type="date"
                value={filter.endDate || ''}
                onChange={(e) =>
                  setFilter({ ...filter, endDate: e.target.value || null })
                }
                className="w-40 h-9 text-sm"
                id="period-end"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('30days')}
            >
              Últimos 30 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('90days')}
            >
              Últimos 90 dias
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('thisyear')}
            >
              Este ano
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset('all')}
            >
              Todos
            </Button>
          </div>
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium">Exibindo:</span> {displayPeriod()}
        </div>
      </div>
    </div>
  )
}
