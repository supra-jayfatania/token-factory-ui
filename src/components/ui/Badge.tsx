import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type BadgeTone = 'neutral' | 'positive' | 'negative' | 'warning'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-surface-raised text-text-muted border-border',
  positive: 'bg-positive/10 text-positive border-positive/30',
  negative: 'bg-negative/10 text-negative border-negative/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}
