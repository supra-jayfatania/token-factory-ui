import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { describeContractError } from '../lib/errors'
import { Button } from './ui/Button'

/** Shown whenever the connected wallet is on a different chain than the app reads from — transactions are blocked until it matches. */
export function WrongNetworkBanner() {
  const { address, chainId: walletChainId, switchChain } = useWallet()
  const { chain } = useChain()
  const [isSwitching, setIsSwitching] = useState(false)

  if (!address || walletChainId === undefined || walletChainId === chain.id) return null

  const onSwitch = async () => {
    setIsSwitching(true)
    try {
      await switchChain(chain.id)
    } catch (error) {
      toast.error(describeContractError(error))
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <div className="border-b border-warning/30 bg-warning/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-2.5">
        <p className="flex items-center gap-2 text-sm text-warning">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Your wallet is on another network. Switch to {chain.name} to send transactions.
        </p>
        <Button size="sm" variant="secondary" onClick={onSwitch} disabled={isSwitching}>
          {isSwitching ? 'Switching…' : `Switch to ${chain.name}`}
        </Button>
      </div>
    </div>
  )
}
