import { addressGradient } from '../lib/identicon'
import { cn } from '../lib/cn'

export function TokenAvatar({
  address,
  symbol,
  size = 'md',
}: {
  address: string
  symbol: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = { sm: 'h-6 w-6 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-11 w-11 text-sm' }
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-bold text-white/90',
        sizeClasses[size],
      )}
      style={{ backgroundImage: addressGradient(address) }}
    >
      {symbol.slice(0, 2).toUpperCase()}
    </span>
  )
}
