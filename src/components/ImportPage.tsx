import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Trash } from '@phosphor-icons/react'
import { Note } from '@/lib/types'
import { toast } from 'sonner'

interface ImportPageProps {
  onImport: (notes: Note[]) => void
  onClear: () => void
}

export function ImportPage({ onImport, onClear }: ImportPageProps) {
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLoad = () => {
    setError(null)
    
    try {
      const parsed = JSON.parse(jsonText)
      
      if (!Array.isArray(parsed)) {
        setError('JSON must be an array of notes')
        return
      }
      
      if (parsed.length === 0) {
        setError('Array is empty')
        return
      }
      
      onImport(parsed)
      toast.success(`${parsed.length} notes loaded successfully`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON format')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Import NF-e Data</CardTitle>
          <CardDescription>
            Paste your fiscal notes JSON array below to begin analyzing your expenses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='[{"note_id": 1, "merchant_name": "...", ...}, ...]'
            className="font-mono text-sm min-h-[300px]"
            id="json-input"
          />
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleLoad} 
              disabled={!jsonText.trim()}
              className="flex-1"
            >
              <Upload className="mr-2" />
              Load Notes
            </Button>
            <Button 
              onClick={onClear} 
              variant="outline"
            >
              <Trash className="mr-2" />
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
