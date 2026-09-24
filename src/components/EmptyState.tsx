import type { LucideIcon } from 'lucide-react'

export function EmptyState({ text, icon: Icon }: { text: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-16 text-center">
      {Icon && <Icon className="h-6 w-6 text-text-faint" />}
      <p className="max-w-xs text-sm text-text-muted">{text}</p>
    </div>
  )
}
