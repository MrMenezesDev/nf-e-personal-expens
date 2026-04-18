import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Note } from '@/lib/types'
import { Upload, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ImportPageProps {
  onImport: (notes: Note[]) => void
  onClear: () => void
}

export function ImportPage({ onImport, onClear }: ImportPageProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState('')

  const handleLoad = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      
      if (!Array.isArray(parsed)) {
        setError('O JSON deve ser um array de notas')
        return
      }
      
      if (parsed.length === 0) {
        setError('O array está vazio')
        return
      }

      setError('')
      onImport(parsed)
      toast.success(`${parsed.length} notas importadas com sucesso!`)
    } catch (e) {
      setError('JSON inválido: ' + (e as Error).message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-2xl">Importar Notas Fiscais</CardTitle>
          <CardDescription>
            Cole o JSON exportado das suas notas fiscais para começar a análise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='[{"note_id": 1, "merchant_name": "...", ...}, ...]'
            className="font-mono text-sm min-h-[300px]"
            id="json-input"
          />
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-3">
            <Button 
              onClick={handleLoad} 
              disabled={!jsonInput.trim()}
              className="flex-1"
            >
              <Upload className="mr-2" />
              Carregar Notas
            </Button>
            <Button 
              onClick={onClear} 
              variant="outline"
            >
              <Trash className="mr-2" />
              Limpar Dados
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
