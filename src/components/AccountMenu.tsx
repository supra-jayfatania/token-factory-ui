import { useQuery } from '@tanstack/react-query'
import { Check, Copy, LogOut, ExternalLink } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { formatEther } from 'viem'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { addressGradient, shortenAddress } from '../lib/identicon'
import { Popover } from './ui/Popover'

export function AccountMenu() {
  const { address, disconnect } = useWallet()
  const { chain, publicClient } = useChain()
  const [copied, setCopied] = useState(false)

  const balanceQuery = useQuery({
    queryKey: ['nativeBalance', chain.id, address],
    enabled: Boolean(address),
    queryFn: () => publicClient.getBalance({ address: address! }),
    refetchInterval: 20_000,
  })

  if (!address) return null

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const explorerUrl = chain.blockExplorers?.default.url
    ? `${chain.blockExplorers.default.url}/address/${address}`
    : undefined

  return (
    <Popover
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-raised pr-3.5 pl-1.5 font-mono text-sm font-semibold text-text transition-colors hover:border-accent/40"
        >
          <span
            className="h-7 w-7 rounded-md"
            style={{ backgroundImage: addressGradient(address) }}
          />
          {shortenAddress(address)}
        </button>
      )}
    >
      {(close) => (
        <div className="w-64">
          <div className="flex items-center gap-3 border-b border-border px-2.5 pb-3">
            <span
              className="h-10 w-10 shrink-0 rounded-lg"
              style={{ backgroundImage: addressGradient(address) }}
            />
            <div className="min-w-0">
              <div className="truncate font-mono text-sm text-text">{shortenAddress(address, 6)}</div>
              <div className="text-xs text-text-muted">
                {balanceQuery.data !== undefined
                  ? `${Number(formatEther(balanceQuery.data)).toFixed(4)} ${chain.nativeCurrency.symbol}`
                  : 'Loading balance…'}
              </div>
            </div>
          </div>

          <div className="pt-1.5">
            <MenuButton onClick={copyAddress} icon={copied ? Check : Copy}>
              {copied ? 'Copied' : 'Copy address'}
            </MenuButton>
            {explorerUrl && (
              <MenuButton
                onClick={() => window.open(explorerUrl, '_blank', 'noopener,noreferrer')}
                icon={ExternalLink}
              >
                View on explorer
              </MenuButton>
            )}
            <MenuButton
              onClick={async () => {
                const revoked = await disconnect()
                close()
                toast.success(
                  revoked
                    ? 'Wallet disconnected.'
                    : "Disconnected from the app. This wallet doesn't support revoking access remotely — remove this site from its connected-sites list to fully disconnect.",
                )
              }}
              icon={LogOut}
              tone="danger"
            >
              Disconnect
            </MenuButton>
          </div>
        </div>
      )}
    </Popover>
  )
}

function MenuButton({
  onClick,
  icon: Icon,
  tone = 'default',
  children,
}: {
  onClick: () => void
  icon: typeof Copy
  tone?: 'default' | 'danger'
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-surface-raised ${
        tone === 'danger' ? 'text-negative' : 'text-text'
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  )
}
