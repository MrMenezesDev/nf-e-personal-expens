import { useState } from 'react'
import { PriceComparison } from '@/lib/types'
import { formatCurrency } from '@/lib/formatters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CaretDown, CaretUp } from '@phosphor-icons/react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface PriceComparisonPageProps {
  priceComparison: PriceComparison[]
}

export function PriceComparisonPage({ priceComparison }: PriceComparisonPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const categories = ['Todas', ...Array.from(new Set(priceComparison.map(p => p.category))).sort()]

  const filteredData = selectedCategory === 'Todas' 
    ? priceComparison 
    : priceComparison.filter(p => p.category === selectedCategory)

  const sortedData = [...filteredData].sort((a, b) => b.price_gap_pct - a.price_gap_pct)

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Comparação de Preços</CardTitle>
            <div className="w-full md:w-[200px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedData.map((item) => {
              const isExpanded = expandedItems.has(item.key)
              return (
                <Card key={item.key} className="bg-muted/30">
                  <CardContent className="pt-4">
                    <div 
                      className="flex items-start justify-between cursor-pointer"
                      onClick={() => toggleExpanded(item.key)}
                    >
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{item.description}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {item.category} • EAN: {item.ean || 'N/A'}
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                            Mais barata: {item.cheapest_merchant}
                          </Badge>
                          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                            Mais cara: {item.most_expensive_merchant}
                          </Badge>
                          <Badge 
                            variant={item.price_gap_pct > 20 ? "destructive" : "secondary"}
                            className="font-semibold"
                          >
                            {item.price_gap_pct.toFixed(1)}% diferença
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Diferença absoluta:</span>{' '}
                          <span className="font-semibold">{formatCurrency(item.price_gap_abs)}</span>
                          <span className="text-muted-foreground ml-3">
                            {item.total_occurrences} {item.total_occurrences === 1 ? 'ocorrência' : 'ocorrências'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-2">
                        {isExpanded ? <CaretUp size={20} /> : <CaretDown size={20} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm font-semibold mb-2">Detalhes por Loja</div>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Loja</TableHead>
                                <TableHead className="text-right">Preço Mínimo</TableHead>
                                <TableHead className="text-right">Preço Médio</TableHead>
                                <TableHead className="text-right">Ocorrências</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {item.merchants
                                .sort((a, b) => a.min_price - b.min_price)
                                .map((merchant, idx) => (
                                <TableRow 
                                  key={idx}
                                  className={
                                    merchant.merchant_name === item.cheapest_merchant 
                                      ? 'bg-success/10' 
                                      : merchant.merchant_name === item.most_expensive_merchant
                                      ? 'bg-destructive/10'
                                      : ''
                                  }
                                >
                                  <TableCell className="font-medium">{merchant.merchant_name}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(merchant.min_price)}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(merchant.avg_price)}</TableCell>
                                  <TableCell className="text-right">{merchant.occurrences}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
            {sortedData.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de comparação disponível para esta categoria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
