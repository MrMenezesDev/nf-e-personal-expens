import { NecessityBreakdown } from '@/lib/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  breakdown: NecessityBreakdown
  className?: string
}

export function NecessityBar({ breakdown, className = '' }: Props) {
  const total = (breakdown.Essencial || 0) + (breakdown.Conveniência || 0) + (breakdown.Supérfluo || 0)
  
  if (total === 0) return null

  const essencialPct = ((breakdown.Essencial || 0) / total) * 100
  const convenienciaPct = ((breakdown.Conveniência || 0) / total) * 100
  const superfluoPct = ((breakdown.Supérfluo || 0) / total) * 100

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-full h-2 rounded-full overflow-hidden flex ${className}`}>
            {essencialPct > 0 && (
              <div 
                className="bg-success" 
                style={{ width: `${essencialPct}%` }}
              />
            )}
            {convenienciaPct > 0 && (
              <div 
                className="bg-accent" 
                style={{ width: `${convenienciaPct}%` }}
              />
            )}
            {superfluoPct > 0 && (
              <div 
                className="bg-destructive" 
                style={{ width: `${superfluoPct}%` }}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            {essencialPct > 0 && <div>Essencial: {essencialPct.toFixed(1)}%</div>}
            {convenienciaPct > 0 && <div>Conveniência: {convenienciaPct.toFixed(1)}%</div>}
            {superfluoPct > 0 && <div>Supérfluo: {superfluoPct.toFixed(1)}%</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
