import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function PageHeading({
  icon: Icon,
  title,
  subtitle,
  align = 'left',
  action,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  align?: 'left' | 'center'
  /** Right-aligned slot for meta info or buttons — only used with align="left". */
  action?: ReactNode
}) {
  if (align === 'center') {
    return (
      <div className="mb-8 text-center">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft">
          <Icon className="h-5 w-5 text-accent" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{title}</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-text-muted">{subtitle}</p>
      </div>
    )
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
          <Icon className="h-5 w-5 text-accent" />
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">{title}</h1>
          <p className="text-sm text-text-muted">{subtitle}</p>
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
