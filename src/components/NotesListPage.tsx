import { useState, useMemo } from 'react'
import { Note } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
import { filterNotesByPeriod, filterNotesByCategory, getFilteredItemsTotal, matchesCategoryFilter } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface NotesListPageProps {
  notes: Note[]
}

export function NotesListPage({ notes }: NotesListPageProps) {
  const [search, setSearch] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const { filter } = usePeriodFilter()

  const filteredNotes = useMemo(() => {
    let periodFiltered = filterNotesByPeriod(notes, filter.startDate, filter.endDate)
    periodFiltered = filterNotesByCategory(periodFiltered, filter.category, filter.subcategory)
    
    if (!search) return periodFiltered

    const searchLower = search.toLowerCase()
    return periodFiltered.filter(note => 
      note.merchant_name.toLowerCase().includes(searchLower)
    )
  }, [notes, filter, search])

  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => 
      b.issued_date.localeCompare(a.issued_date)
    )
  }, [filteredNotes])

  const isCategoryFiltered = filter.category !== 'Todas' || filter.subcategory !== 'Todas'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Extrato</h1>
        <p className="text-muted-foreground">Navegue e busque suas notas fiscais</p>
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome do estabelecimento..."
          className="pl-10"
          id="search-notes"
        />
      </div>

      {sortedNotes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search
            ? 'Nenhuma nota encontrada com este critério de busca'
            : 'Nenhuma nota encontrada para o período selecionado.'}
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Estabelecimento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Itens</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedNotes.map((note) => (
                <TableRow 
                  key={note.note_id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedNote(note)}
                >
                  <TableCell className="font-mono text-sm">{formatDate(note.issued_date)}</TableCell>
                  <TableCell className="font-medium">{note.merchant_name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(getFilteredItemsTotal(note, filter.category, filter.subcategory))}
                  </TableCell>
                  <TableCell className="text-right">
                    {isCategoryFiltered 
                      ? note.items.filter(item => matchesCategoryFilter(item, filter.category, filter.subcategory)).length
                      : note.items.length
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!selectedNote} onOpenChange={(open) => !open && setSelectedNote(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedNote && (
            <>
              <SheetHeader>
                <SheetTitle className="text-2xl">{selectedNote.merchant_name}</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <Badge variant="outline" className="font-mono">
                    {formatDate(selectedNote.issued_date)}
                  </Badge>
                  <Badge variant="secondary">
                    {selectedNote.merchant_uf}
                  </Badge>
                  <div className="text-2xl font-bold font-mono text-primary">
                    {formatCurrency(selectedNote.total_amount)}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4 text-lg">
                    Itens ({selectedNote.items.length})
                    {isCategoryFiltered && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({selectedNote.items.filter(item => matchesCategoryFilter(item, filter.category, filter.subcategory)).length} correspondentes)
                      </span>
                    )}
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Qtd</TableHead>
                          <TableHead className="text-right">Preço Unit.</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedNote.items.map((item) => {
                          const matches = matchesCategoryFilter(item, filter.category, filter.subcategory)
                          return (
                            <TableRow 
                              key={item.line_n}
                              className={cn(
                                isCategoryFiltered && matches && 'bg-accent/10',
                                isCategoryFiltered && !matches && 'opacity-40'
                              )}
                            >
                              <TableCell className="font-mono text-sm text-muted-foreground">
                                {item.line_n}
                              </TableCell>
                              <TableCell className="font-medium text-sm">
                                {item.description}
                                {matches && item.category && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {item.category}{item.subcategory ? ` › ${item.subcategory}` : ''}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                {item.qty} {item.unit}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm">
                                {formatCurrency(item.unit_price)}
                              </TableCell>
                              <TableCell className="text-right font-mono text-sm font-semibold">
                                {formatCurrency(item.line_total)}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Número da Nota:</span>
                    <span className="font-mono">{selectedNote.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Série:</span>
                    <span className="font-mono">{selectedNote.serie}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CNPJ:</span>
                    <span className="font-mono">{selectedNote.merchant_cnpj}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
