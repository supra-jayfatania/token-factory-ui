import { Check, ChevronDown, Search } from 'lucide-react'
import { useState } from 'react'
import type { TokenInfo } from '../hooks/useTokenList'
import { shortenAddress } from '../lib/identicon'
import { TokenAvatar } from './TokenAvatar'
import { CopyButton } from './ui/CopyButton'
import { Input } from './ui/Input'
import { Popover } from './ui/Popover'

// Rows hold a copy button next to the address, and a button can't nest in a
// button, so each row is a div with a full-size transparent select button laid
// over it; the copy button sits above that overlay via `relative`.

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
        <div className="relative flex h-14 w-full items-center gap-3 rounded-xl border border-border bg-surface-raised px-3 transition-colors hover:border-accent/40">
          <button
            type="button"
            onClick={toggle}
            aria-label={selected ? `Change token (${selected.symbol} selected)` : 'Select a token'}
            aria-expanded={open}
            className="absolute inset-0 rounded-xl"
          />
          {selected ? (
            <>
              <TokenAvatar address={selected.address} symbol={selected.symbol} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-text">{selected.symbol}</span>
                <span className="flex items-center gap-1">
                  <span className="font-mono text-xs text-text-faint">{shortenAddress(selected.address)}</span>
                  <CopyButton value={selected.address} className="relative" />
                </span>
              </span>
            </>
          ) : (
            <span className="flex-1 text-sm text-text-muted">Select a token</span>
          )}
          <ChevronDown className={`h-4 w-4 text-text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      )}
    >
      {(close) => (
        <TokenOptions
          tokens={tokens}
          value={value}
          onSelect={(address) => {
            onChange(address)
            close()
          }}
        />
      )}
    </Popover>
  )
}

/** The open panel. Its own component so the search query resets each time the picker closes. */
function TokenOptions({
  tokens,
  value,
  onSelect,
}: {
  tokens: TokenInfo[]
  value: `0x${string}` | undefined
  onSelect: (address: `0x${string}`) => void
}) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const matches = needle
    ? tokens.filter((t) => t.symbol.toLowerCase().includes(needle) || t.name.toLowerCase().includes(needle))
    : tokens

  if (tokens.length === 0) {
    return <p className="px-2.5 py-3 text-sm text-text-muted">No tokens found yet.</p>
  }

  return (
    <>
      <div className="relative mb-1.5">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-faint" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter picks the top match; preventDefault keeps it from submitting an enclosing form.
            if (e.key === 'Enter') {
              e.preventDefault()
              if (matches[0]) onSelect(matches[0].address)
            }
          }}
          placeholder="Search by name or symbol"
          aria-label="Search tokens by name or symbol"
          className="pl-9"
        />
      </div>
      <div className="max-h-72 overflow-y-auto">
        {matches.length === 0 && (
          <p className="px-2.5 py-3 text-sm text-text-muted">No tokens match “{query.trim()}”.</p>
        )}
        {matches.map((token) => (
          <div
            key={token.address}
            className="relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-surface-raised"
          >
            <button
              type="button"
              onClick={() => onSelect(token.address)}
              aria-label={`Select ${token.symbol}`}
              className="absolute inset-0 rounded-lg"
            />
            <TokenAvatar address={token.address} symbol={token.symbol} size="sm" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-text">{token.symbol}</span>
              <span className="flex items-center gap-1">
                <span className="font-mono text-[11px] text-text-faint">{shortenAddress(token.address)}</span>
                <CopyButton value={token.address} className="relative" />
              </span>
            </span>
            {token.address === value && <Check className="h-4 w-4 text-accent" />}
          </div>
        ))}
      </div>
    </>
  )
}
