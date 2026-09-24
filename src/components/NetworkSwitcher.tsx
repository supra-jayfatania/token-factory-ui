import { Check, ChevronDown, Globe } from 'lucide-react'
import { supportedChains } from '../config/chains'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { Popover } from './ui/Popover'

export function NetworkSwitcher() {
  const { chainId, chain, setChainId } = useChain()
  const { address, chainId: walletChainId, switchChain } = useWallet()

  const onChange = async (nextChainId: number, close: () => void) => {
    setChainId(nextChainId)
    close()
    if (address && walletChainId !== nextChainId) {
      try {
        await switchChain(nextChainId)
      } catch {
        // Rejected, or the wallet doesn't support this chain — the app still
        // switches its own read context; only the wallet's signing chain stays put.
      }
    }
  }

  return (
    <Popover
      align="left"
      trigger={({ toggle, open }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-raised px-3.5 text-sm font-semibold text-text transition-colors hover:border-accent/40"
        >
          <Globe className="h-4 w-4 text-text-muted" />
          {chain.name}
          <ChevronDown className={`h-3.5 w-3.5 text-text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    >
      {(close) => (
        <div className="w-56">
          <p className="px-2.5 pb-1.5 pt-1 text-xs font-medium tracking-wide text-text-faint uppercase">
            Switch network
          </p>
          {supportedChains.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id, close)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-text transition-colors hover:bg-surface-raised"
            >
              <span className={`h-2 w-2 rounded-full ${c.testnet ? 'bg-warning' : 'bg-positive'}`} />
              <span className="flex-1">{c.name}</span>
              {c.id === chainId && <Check className="h-4 w-4 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </Popover>
  )
}
