import { useState } from 'react'
import { Textarea } from '@/components/ui/texta
import { Alert, AlertDescription } from '@/componen
import { Note } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Trash } from '@phosphor-icons/react'
import { Note } from '@/lib/types'
import { toast } from 'sonner'

  const handleLoad = () => 
    
      const parsed = 
 

      
        setError('Array is empty')
      }

    } catch (e) {
    }

    <div 
        <CardHeader>
      
          </CardDescription>
        <CardContent className="space-y-4">
            va
       
      
          
        setError('Array is empty')
            </
      }
      
              disabled
            >
    } catch (e) {
            <Button 
    }
   

        </
    </div>
}
        <CardHeader>



          </CardDescription>

        <CardContent className="space-y-4">







          











            >

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
