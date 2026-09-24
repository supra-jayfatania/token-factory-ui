import { ArrowUpRight, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useWallet } from '../context/WalletContext'
import { useWalletOptions, type WalletOption } from '../hooks/useWalletOptions'
import { describeContractError } from '../lib/errors'
import { cn } from '../lib/cn'
import { Modal } from './ui/Modal'
import { Spinner } from './ui/Spinner'

export function WalletConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { connect } = useWallet()
  const options = useWalletOptions()
  const [connectingId, setConnectingId] = useState<string | null>(null)

  const onSelect = async (option: WalletOption) => {
    if (connectingId) return

    if (!option.provider) {
      if (option.installUrl) window.open(option.installUrl, '_blank', 'noopener,noreferrer')
      return
    }

    setConnectingId(option.id)
    try {
      await connect(option)
      toast.success(`Connected to ${option.name}.`)
      onClose()
    } catch (error) {
      toast.error(describeContractError(error))
    } finally {
      setConnectingId(null)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Connect a wallet"
      description="Choose a wallet to continue. New here? StarKey is Supra's own wallet."
    >
      <div className="space-y-1">
        {options.length === 0 && (
          <p className="px-1 py-4 text-sm text-text-muted">
            No wallet extensions detected in this browser.
          </p>
        )}
        {options.map((option) => {
          const isConnecting = connectingId === option.id
          const isDisabled = connectingId !== null && !isConnecting
          return (
            <button
              key={option.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(option)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-colors',
                'hover:border-border hover:bg-surface-raised disabled:opacity-40',
                isConnecting && 'border-border bg-surface-raised',
              )}
            >
              <WalletIcon option={option} />
              <span className="flex-1">
                <span className="block text-sm font-medium text-text">{option.name}</span>
                {!option.provider && (
                  <span className="block text-xs text-text-muted">Not installed</span>
                )}
                {isConnecting && (
                  <span className="block text-xs text-accent">Requesting connection…</span>
                )}
              </span>
              {isConnecting && <Spinner className="h-4 w-4 text-accent" />}
              {!option.provider && !isConnecting && (
                <ArrowUpRight className="h-4 w-4 text-text-faint" />
              )}
            </button>
          )
        })}
      </div>

      <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface-raised px-3 py-2.5 text-xs text-text-muted">
        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
        This app never asks for your seed phrase or private key.
      </p>
    </Modal>
  )
}

function WalletIcon({ option }: { option: WalletOption }) {
  if (option.icon) {
    return (
      <img src={option.icon} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
    )
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-sm font-bold text-accent">
      {option.name.slice(0, 1)}
    </span>
  )
}
