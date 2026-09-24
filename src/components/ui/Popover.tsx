import { useRef, useState, type ReactNode } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'
import { cn } from '../../lib/cn'

export function Popover({
  trigger,
  children,
  align = 'right',
  panelClassName,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
  panelClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = () => setOpen(false)

  useClickOutside(ref, close, open)

  return (
    <div className="relative" ref={ref}>
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          className={cn(
            'animate-scale-in absolute z-30 mt-2 min-w-56 rounded-xl border border-border bg-surface p-1.5 shadow-2xl',
            align === 'right' ? 'right-0' : 'left-0',
            panelClassName,
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  )
}
