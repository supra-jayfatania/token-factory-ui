import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '../../lib/cn'

export function CopyButton({
  value,
  label = 'Copy address',
  className,
}: {
  value: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Could not copy to clipboard.')
    }
  }

  const Icon = copied ? Check : Copy

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied' : label}
      className={cn(
        'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded text-text-faint transition-colors hover:bg-surface-hover hover:text-text',
        copied && 'text-positive hover:text-positive',
        className,
      )}
    >
      <Icon className="h-3 w-3" />
    </button>
  )
}
