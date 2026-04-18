import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Note } from '@/lib/types'
import { ImportPage } from '@/components/ImportPage'
import { OverviewPage } from '@/components/OverviewPage'
import { CategoriesPage } from '@/components/CategoriesPage'
import { NotesListPage } from '@/components/NotesListPage'
import { ItemsPage } from '@/components/ItemsPage'
import { PeriodFilterBar } from '@/components/PeriodFilterBar'
import { PeriodFilterProvider } from '@/contexts/PeriodFilterContext'
import { ChartBar, Receipt, Package, Tag } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

type Page = 'overview' | 'categorias' | 'extrato' | 'items'

function App() {
  const [notes, setNotes] = useKV<Note[]>('notes', [])
  const [currentPage, setCurrentPage] = useState<Page>('overview')

  const handleImport = (importedNotes: Note[]) => {
    setNotes(importedNotes)
  }

  const handleClear = async () => {
    if (window.confirm('Tem certeza de que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      setNotes([])
    }
  }

  if (!notes || notes.length === 0) {
    return (
      <>
        <ImportPage onImport={handleImport} onClear={handleClear} />
        <Toaster />
      </>
    )
  }

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
                  onClick={() => setCurrentPage('items')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                    currentPage === 'items'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <Package weight={currentPage === 'items' ? 'fill' : 'regular'} />
                  Itens e Preços
                </button>
              </div>
            </div>
          </div>
        </nav>

        <PeriodFilterBar notes={notes} />

        <main className="container mx-auto px-4 md:px-4 py-6 md:py-8 pb-20 md:pb-8">
          {currentPage === 'overview' && <OverviewPage notes={notes} />}
          {currentPage === 'categorias' && <CategoriesPage notes={notes} />}
          {currentPage === 'extrato' && <NotesListPage notes={notes} />}
          {currentPage === 'items' && <ItemsPage notes={notes} />}
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-card safe-area-inset-bottom">
          <div className="grid grid-cols-4 h-14">
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
              onClick={() => setCurrentPage('categorias')}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px]',
                currentPage === 'categorias'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Tag weight={currentPage === 'categorias' ? 'fill' : 'regular'} size={20} />
              <span className="text-xs">Categorias</span>
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
