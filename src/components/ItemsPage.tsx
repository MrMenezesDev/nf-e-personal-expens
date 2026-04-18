import { useState, useMemo } from 'react'
import { Note, NoteItem } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ItemsPageProps {
  notes: Note[]
}

interface ItemOccurrence {
  item: NoteItem
  note: Note
}

export function ItemsPage({ notes }: ItemsPageProps) {
  const [search, setSearch] = useState('')

  const searchResults = useMemo(() => {
    if (!search || search.trim().length < 2) return []

    const searchLower = search.toLowerCase()
    const occurrences: ItemOccurrence[] = []

    notes.forEach(note => {
      note.items.forEach(item => {
        if (item.description_norm.toLowerCase().includes(searchLower)) {
          occurrences.push({ item, note })
        }
      })
    })

    return occurrences.sort((a, b) => 
      a.note.issued_date.localeCompare(b.note.issued_date)
    )
  }, [notes, search])

  const priceStats = useMemo(() => {
    if (searchResults.length === 0) return null

    const prices = searchResults.map(r => r.item.unit_price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length

    return { min, max, avg, count: searchResults.length }
  }, [searchResults])

  const priceChartData = useMemo(() => {
    return searchResults.map(r => ({
      date: formatDate(r.note.issued_date),
      price: r.item.unit_price,
      fullDate: r.note.issued_date
    }))
  }, [searchResults])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Items & Prices</h1>
        <p className="text-muted-foreground">Track price history for specific products</p>
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a product (e.g., 'ovos', 'leite')..."
          className="pl-10"
          id="search-items"
        />
      </div>

      {search && search.trim().length < 2 && (
        <div className="text-center py-12 text-muted-foreground">
          Type at least 2 characters to search
        </div>
      )}

      {search && search.trim().length >= 2 && searchResults.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No items found matching "{search}"
        </div>
      )}

      {searchResults.length > 0 && priceStats && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Min Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-success">{formatCurrency(priceStats.min)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Max Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-destructive">{formatCurrency(priceStats.max)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-primary">{formatCurrency(priceStats.avg)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Occurrences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{priceStats.count}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Price Evolution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={priceChartData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 250)" />
                  <XAxis 
                    dataKey="date" 
                    style={{ fontSize: '11px' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    domain={['dataMin - 1', 'dataMax + 1']}
                  />
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
                    dataKey="price" 
                    stroke="oklch(0.45 0.12 200)" 
                    strokeWidth={2}
                    dot={{ fill: 'oklch(0.45 0.12 200)', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Occurrences ({searchResults.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((result, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(result.note.issued_date)}
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {result.item.description}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.note.merchant_name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold">
                          {formatCurrency(result.item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {result.item.qty} {result.item.unit}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(result.item.line_total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
