import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, ShieldCheck, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '../components/EmptyState'
import { PageHeading } from '../components/PageHeading'
import { TokenAvatar } from '../components/TokenAvatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { Spinner } from '../components/ui/Spinner'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import type { TokenInfo } from '../hooks/useTokenList'
import { useTokenList } from '../hooks/useTokenList'
import { describeContractError } from '../lib/errors'
import { shortenAddress } from '../lib/identicon'
import { readBalance } from '../lib/reads/token'
import { approve, transfer } from '../lib/tx/token'
import { formatTokenAmount, parseTokenAmount } from '../lib/units'

export function Wallet() {
  const { address } = useWallet()
  const { tokens, isLoading } = useTokenList()

  if (!address) {
    return <EmptyState icon={WalletCards} text="Connect a wallet to see your balances." />
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        icon={WalletCards}
        title="Wallet"
        subtitle="Balances for every token on this factory."
        action={<Badge tone="neutral">{tokens.length} token{tokens.length === 1 ? '' : 's'}</Badge>}
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {tokens.map((token) => (
          <TokenRow key={token.address} token={token} owner={address} />
        ))}
      </div>

      {!isLoading && tokens.length === 0 && (
        <EmptyState icon={WalletCards} text="No tokens found for this factory yet." />
      )}
    </div>
  )
}

function TokenRow({ token, owner }: { token: TokenInfo; owner: `0x${string}` }) {
  const { publicClient, chainId } = useChain()
  const { walletClient } = useWallet()
  const [open, setOpen] = useState<'transfer' | 'approve' | null>(null)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const balanceQuery = useQuery({
    queryKey: ['balance', chainId, token.address, owner],
    queryFn: () => readBalance({ client: publicClient, tokenAddress: token.address }, owner),
    refetchInterval: 20_000,
  })

  const submit = async () => {
    if (!walletClient || !amount || !recipient) return
    setIsSubmitting(true)
    const toastId = toast.loading('Confirm in your wallet…')
    try {
      const value = parseTokenAmount(amount, token.decimals)
      if (open === 'transfer') {
        await transfer(
          { walletClient, publicClient, tokenAddress: token.address },
          recipient as `0x${string}`,
          value,
        )
        toast.success('Transfer sent.', { id: toastId })
      } else if (open === 'approve') {
        await approve(
          { walletClient, publicClient, tokenAddress: token.address },
          recipient as `0x${string}`,
          value,
        )
        toast.success('Approval sent.', { id: toastId })
      }
      setAmount('')
      setRecipient('')
      setOpen(null)
      balanceQuery.refetch()
    } catch (error) {
      toast.error(describeContractError(error), { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <TokenAvatar address={token.address} symbol={token.symbol} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-text">{token.symbol}</div>
          <div className="font-mono text-xs text-text-faint">
            {shortenAddress(token.address)} · {token.decimals} decimals
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-semibold text-text">
            {balanceQuery.data !== undefined
              ? formatTokenAmount(balanceQuery.data, token.decimals)
              : '—'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2 border-t border-border pt-3">
        <Button
          variant={open === 'transfer' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setOpen(open === 'transfer' ? null : 'transfer')}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Transfer
        </Button>
        <Button
          variant={open === 'approve' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setOpen(open === 'approve' ? null : 'approve')}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Approve
        </Button>
      </div>

      {open && (
        <div className="animate-scale-in mt-3 grid grid-cols-1 gap-3 rounded-xl bg-surface-raised p-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <Label>{open === 'transfer' ? 'Recipient' : 'Spender'}</Label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x…"
              className="font-mono"
            />
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="font-mono"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={submit} disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {isSubmitting ? 'Sending…' : open === 'transfer' ? 'Send' : 'Approve'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
