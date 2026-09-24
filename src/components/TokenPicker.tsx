import { Check, ChevronDown } from 'lucide-react'
import type { TokenInfo } from '../hooks/useTokenList'
import { shortenAddress } from '../lib/identicon'
import { TokenAvatar } from './TokenAvatar'
import { Popover } from './ui/Popover'

export function TokenPicker({
  tokens,
  value,
  onChange,
}: {
  tokens: TokenInfo[]
  value: `0x${string}` | undefined
  onChange: (address: `0x${string}`) => void
}) {
  const selected = tokens.find((t) => t.address === value)

  return (
    <Popover
      align="left"
      panelClassName="w-full"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex h-14 w-full items-center gap-3 rounded-xl border border-border bg-surface-raised px-3 text-left transition-colors hover:border-accent/40"
        >
          {selected ? (
            <>
              <TokenAvatar address={selected.address} symbol={selected.symbol} />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-text">{selected.symbol}</span>
                <span className="block font-mono text-xs text-text-faint">
                  {shortenAddress(selected.address)}
                </span>
              </span>
            </>
          ) : (
            <span className="flex-1 text-sm text-text-muted">Select a token</span>
          )}
          <ChevronDown className={`h-4 w-4 text-text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    >
      {(close) => (
        <div className="max-h-72 overflow-y-auto">
          {tokens.length === 0 && (
            <p className="px-2.5 py-3 text-sm text-text-muted">No tokens found yet.</p>
          )}
          {tokens.map((token) => (
            <button
              key={token.address}
              type="button"
              onClick={() => {
                onChange(token.address)
                close()
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-surface-raised"
            >
              <TokenAvatar address={token.address} symbol={token.symbol} size="sm" />
              <span className="flex-1">
                <span className="block text-sm font-medium text-text">{token.symbol}</span>
                <span className="block font-mono text-[11px] text-text-faint">
                  {shortenAddress(token.address)}
                </span>
              </span>
              {token.address === value && <Check className="h-4 w-4 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}
