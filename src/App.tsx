import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Note } from '@/lib/types'
import { ImportPage } from '@/components/ImportPage'
import { OverviewPage } from '@/components/OverviewPage'
import { NotesListPage } from '@/components/NotesListPage'
import { ItemsPage } from '@/components/ItemsPage'
import { ChartBar, Receipt, Package } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/sonner'

type Page = 'overview' | 'extrato' | 'items'

function App() {
  const [notes, setNotes] = useKV<Note[]>('notes', [])
  const [currentPage, setCurrentPage] = useState<Page>('overview')

  const handleImport = (importedNotes: Note[]) => {
    setNotes(importedNotes)
  }

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
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
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">NF-e Dashboard</h1>
            <div className="flex gap-2">
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
                Overview
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
                Items & Prices
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {currentPage === 'overview' && <OverviewPage notes={notes} />}
        {currentPage === 'extrato' && <NotesListPage notes={notes} />}
        {currentPage === 'items' && <ItemsPage notes={notes} />}
      </main>

      <Toaster />
    </div>
  )
}

export default App