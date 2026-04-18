import { useMemo, useState } from 'react'
import { Note, NoteItem } from '@/lib/types'
  PieChart,
  Cell,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
import { fil
import 
  Table,
  TableC
  TableHea
} from '@/compo
} from 'recharts'
import { usePeriodFilter } from '@/contexts/PeriodFilterContext'
  'oklch(0.45 0
}

  'oklch(0.58 0.16 240

  'oklch(0.72 0.15 75)',
}
  const { filter } = useP
  const filteredNotes = u

    const items: ItemWith
 

          merchant_name: note.merchant_na
      })
    return items
}

  }, [allItems, selectedCategory])
  const kpis = useMemo(() => {
    const subcategories = new Set<string>()

    allItems.forEach(item => {
        categories.add(item.category)
  }, [notes, filter])

      if (item.subcategory && item
      }

      categoriesCount: categories.
      categorizedCou
    }

    const categoryTotals = new Map<string, 
    filter
      co
    })
    const data =
  }, [filteredNotes])

    return { data, total }

    const subcategoryTotals = new Map<string, number>()
    filteredItems.forEach(item => 

    })
    return Array.from(subcategoryTotals.
      .sort((a, b) => b.value - a.value)

    const monthCategoryMap = n

      const category = item.ca
      if (!monthCategoryMap.has(month)) {
      }
      const categoryMap = 
      category

      n

      .sort((a, b) => a[0].localeCompare(b[0]))
        const entry: { month: string; [key:
       
    })

    return {
  const itemsForCategory = useMemo(() =
    return filteredItems.filter(item => item.

    return (
     
            Nenh

  const categorySpending = useMemo(() => {
      </div>

  const renderCustomLabel = (entry:
      const category = item.category || 'Sem Categoria'
  return (
      <div>
      

        <div className="flex items-center gap-2 bg-mu
      .map(([name, value]) => ({ name, value }))
          <span className="text-sm text-

            size="sm"

            <X />
  }, [filteredItems])

      <div className="grid gap-4 md:grid-cols
          <CardHeader>

          </CardHeader>
            <div className="text-3xl font-bold font-mono">{kpis.
        </Card>
        <Card>
      

          <CardContent>
          </CardContent>

            <CardTitl

          <CardContent>
          </CardContent>

          <CardHeader>
              Itens Não Categorizados
          </CardHeader>

        </Card>

       

          <CardContent>
              <PieChart>
                  data={categorySpending.data}
      

                  label={renderCus
                  style={{ cursor: 'pointer' }}
            

                    />
                </Pie>
                  formatter={(value: n
              </PieChart>

              {categorySpending.data.map((item, index) => 
          
        return entry
        

                    <span class
                    <

                  </div>
              ))}
          </CardContent>


          </CardHeader>
    return (
                <div key={item.name} className="space-y-1">
                    <span className="font-mediu
                      {formatCurrency(item.value)}
                  </div>
               
                      style={{
                        backgroundColor: CHART_COLORS[index % CHAR
              
              
      </div>
     
  }

            <CardTitle>Categorias ao Longo do Tempo</CardTitle>
          <CardContent>
  }

          
                />
      <div>
                    type="monotone"
                    stackId="1"
            

            </ResponsiveCont
        </Card>

        <Card>
            <Card
          <CardContent>
              <TableHeader>
                 
                  <TableHea
                  <Ta
                  <TableHead className="text-right">T
            className="ml-auto"
           
            <X />
                    </Tab
                   
              
      )}

                    <TableCell className="text-right font-mono f
              
          <CardHeader>
            </Table>
              Categorias Únicas
    </div>
}


          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subcategorias Únicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{kpis.subcategoriesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens Categorizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{kpis.categorizedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens Não Categorizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{kpis.uncategorizedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gasto por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categorySpending.data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={renderCustomLabel}
                  onClick={(data) => setSelectedCategory(data.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {categorySpending.data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-2">
              {categorySpending.data.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-muted-foreground">
                      {((item.value / categorySpending.total) * 100).toFixed(1)}%
                    </span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gasto por Subcategoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {subcategorySpending.map((item, index) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${(item.value / subcategorySpending[0].value) * 100}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {categoryOverTime.data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categorias ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={categoryOverTime.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                {categoryOverTime.categories.map((category, index) => (
                  <Area
                    key={category}
                    type="monotone"
                    dataKey={category}
                    stackId="1"
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {selectedCategory && itemsForCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens em {selectedCategory}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Estabelecimento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Subcategoria</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Valor Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemsForCategory.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-sm">
                      {formatDate(item.issued_date)}
                    </TableCell>
                    <TableCell className="text-sm">{item.merchant_name}</TableCell>
                    <TableCell className="text-sm">{item.description}</TableCell>
                    <TableCell className="text-sm">{item.subcategory || '-'}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {item.qty} {item.unit}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatCurrency(item.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-sm">
                      {formatCurrency(item.line_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
