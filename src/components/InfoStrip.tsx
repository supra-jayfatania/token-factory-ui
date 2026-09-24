import type { LucideIcon } from 'lucide-react'

export type InfoTile = {
  icon: LucideIcon
  title: string
  description: string
}

export function InfoStrip({ tiles }: { tiles: InfoTile[] }) {
  return (
    <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div key={tile.title} className="rounded-2xl border border-border bg-surface p-5">
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft">
            <tile.icon className="h-4 w-4 text-accent" />
          </span>
          <h3 className="text-sm font-semibold text-text">{tile.title}</h3>
          <p className="mt-1 text-sm text-text-muted">{tile.description}</p>
        </div>
      ))}
    </div>
  )
}
