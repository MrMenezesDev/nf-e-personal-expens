import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { SparkData } from '@/lib/types'
import { ImportPage } from '@/components/ImportPage'
import { OverviewPage } from '@/components/OverviewPage'
import { CategoriesPage } from '@/components/CategoriesPage'
import { NotesListPage } from '@/components/NotesListPage'
import { ItemsPage } from '@/components/ItemsPage'
import { InsightsPage } from '@/components/InsightsPage'
import { PriceComparisonPage } from '@/components/PriceComparisonPage'
import { PeriodFilterBar } from '@/components/PeriodFilterBar'
import { PeriodFilterProvider } from '@/contexts/PeriodFilterContext'
import { ChartBar, Receipt, Package, Tag, Lightbulb, ChartLine } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

type Page = 'overview' | 'categorias' | 'extrato' | 'items' | 'insights' | 'precos'

function App() {
  const [sparkData, setSparkData] = useKV<SparkData | null>('spark_data', null)
  const [currentPage, setCurrentPage] = useState<Page>('overview')

  const handleImport = (importedNotes: any) => {
    if (Array.isArray(importedNotes)) {
      setSparkData((prev) => ({
        summary: prev?.summary || {
          total_notes: 0,
          total_spent: 0,
          avg_ticket: 0,
          median_ticket: 0,
          min_ticket: 0,
          max_ticket: 0,
          outlier_count: 0,
          total_savings_opportunity: 0,
          date_range: { first: '', last: '' },
          necessity_totals: { Essencial: 0, Conveniência: 0, Supérfluo: 0, 'Não classificado': 0 },
          category_totals: [],
          merchant_totals: []
        },
        notes: importedNotes,
        price_comparison: prev?.price_comparison || [],
        monthly_summaries: prev?.monthly_summaries || []
      }))
    } else if (importedNotes.summary && importedNotes.notes) {
      setSparkData(importedNotes)
    }
  }

  const handleClear = async () => {
    if (window.confirm('Tem certeza de que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      setSparkData(null)
    }
  }

  if (!sparkData || !sparkData.notes || sparkData.notes.length === 0) {
    return (
      <>
        <ImportPage onImport={handleImport} onClear={handleClear} />
        <Toaster />
      </>
    )
  }

  const notes = sparkData.notes

  return (
    <PeriodFilterProvider>
      <div className="min-h-screen bg-background pb-0 md:pb-0">
        <nav className="border-b bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg md:text-xl font-bold">Painel NF-e</h1>
              <div className="hidden md:flex gap-2">
                <button
                  onClick={() => setCurrentPage('overview')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    currentPage === 'overview'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <ChartBar weight={currentPage === 'overview' ? 'fill' : 'regular'} />
                  Visão Geral
                </button>
                <button
                  onClick={() => setCurrentPage('insights')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    currentPage === 'insights'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <Lightbulb weight={currentPage === 'insights' ? 'fill' : 'regular'} />
                  Insights
                </button>
                <button
                  onClick={() => setCurrentPage('categorias')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    currentPage === 'categorias'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <Tag weight={currentPage === 'categorias' ? 'fill' : 'regular'} />
                  Categorias
                </button>
                <button
                  onClick={() => setCurrentPage('extrato')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    currentPage === 'extrato'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <Receipt weight={currentPage === 'extrato' ? 'fill' : 'regular'} />
                  Extrato
                </button>
                <button
                  onClick={() => setCurrentPage('precos')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    currentPage === 'precos'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <ChartLine weight={currentPage === 'precos' ? 'fill' : 'regular'} />
                  Preços
                </button>
                <button
                  onClick={() => setCurrentPage('items')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    currentPage === 'items'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <Package weight={currentPage === 'items' ? 'fill' : 'regular'} />
                  Itens
                </button>
              </div>
            </div>
          </div>
        </nav>

        <PeriodFilterBar notes={notes} />

        <main className="container mx-auto px-4 md:px-4 py-6 md:py-8 pb-20 md:pb-8">
          {currentPage === 'overview' && <OverviewPage notes={notes} />}
          {currentPage === 'insights' && <InsightsPage data={sparkData} />}
          {currentPage === 'categorias' && <CategoriesPage notes={notes} />}
          {currentPage === 'extrato' && <NotesListPage notes={notes} />}
          {currentPage === 'precos' && <PriceComparisonPage priceComparison={sparkData.price_comparison} />}
          {currentPage === 'items' && <ItemsPage notes={notes} />}
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card safe-area-inset-bottom">
          <div className="grid grid-cols-5 h-14">
            <button
              onClick={() => setCurrentPage('overview')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]',
                currentPage === 'overview'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <ChartBar weight={currentPage === 'overview' ? 'fill' : 'regular'} size={20} />
              <span className="text-xs">Visão</span>
            </button>
            <button
              onClick={() => setCurrentPage('insights')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]',
                currentPage === 'insights'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Lightbulb weight={currentPage === 'insights' ? 'fill' : 'regular'} size={20} />
              <span className="text-xs">Insights</span>
            </button>
            <button
              onClick={() => setCurrentPage('extrato')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]',
                currentPage === 'extrato'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Receipt weight={currentPage === 'extrato' ? 'fill' : 'regular'} size={20} />
              <span className="text-xs">Extrato</span>
            </button>
            <button
              onClick={() => setCurrentPage('precos')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]',
                currentPage === 'precos'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <ChartLine weight={currentPage === 'precos' ? 'fill' : 'regular'} size={20} />
              <span className="text-xs">Preços</span>
            </button>
            <button
              onClick={() => setCurrentPage('items')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]',
                currentPage === 'items'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Package weight={currentPage === 'items' ? 'fill' : 'regular'} size={20} />
              <span className="text-xs">Itens</span>
            </button>
          </div>
        </nav>

        <Toaster />
      </div>
    </PeriodFilterProvider>
  )
}

export default App
