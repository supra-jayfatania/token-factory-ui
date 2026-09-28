import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, Settings2, ShieldCheck, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { EmptyState } from '../components/EmptyState'
import { FieldHint } from '../components/MintLimitsFields'
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
import { useCreatedTokens, useTokenOwners } from '../hooks/useTokenOwnership'
import { cn } from '../lib/cn'
import { describeContractError } from '../lib/errors'
import { addressInputError, sameAddress, shortenAddress } from '../lib/identicon'
import { readBalance } from '../lib/reads/token'
import { approve, transfer } from '../lib/tx/token'
import { formatAmount, invalidAmountMessage, parseAmount } from '../lib/units'

type Filter = 'all' | 'created'

export function Wallet() {
  const { address } = useWallet()
  const { tokens, isLoading, isError } = useTokenList()
  const { created } = useCreatedTokens()
  const { owners } = useTokenOwners(tokens)
  const [filter, setFilter] = useState<Filter>('all')

  if (!address) {
    return <EmptyState icon={WalletCards} text="Connect a wallet to see your balances." />
  }

  const visible = filter === 'created' ? tokens.filter((t) => created.has(t.address.toLowerCase())) : tokens

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        icon={WalletCards}
        title="Wallet"
        subtitle="Balances for every token created by this factory."
        action={
          <div className="flex rounded-lg border border-border bg-surface-raised p-0.5">
            {(
              [
                ['all', `All (${tokens.length})`],
                ['created', `Created by me (${created.size})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                  filter === value ? 'bg-accent-soft text-accent' : 'text-text-muted hover:text-text',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {visible.map((token) => (
          <TokenRow
            key={token.address}
            token={token}
            owner={address}
            isTokenOwner={sameAddress(owners[token.address.toLowerCase()], address)}
          />
        ))}
      </div>

      {!isLoading && visible.length === 0 && (
        <EmptyState
          icon={WalletCards}
          text={
            isError
              ? "Couldn't load the factory's tokens. Retrying…"
              : filter === 'created'
                ? "This wallet hasn't created any tokens yet."
                : 'No tokens found for this factory yet.'
          }
        />
      )}
    </div>
  )
}

function TokenRow({ token, owner, isTokenOwner }: { token: TokenInfo; owner: `0x${string}`; isTokenOwner: boolean }) {
  const { publicClient, chainId } = useChain()
  const { walletClient } = useWallet()
  const navigate = useNavigate()
  const [open, setOpen] = useState<'transfer' | 'approve' | null>(null)
  const [recipient, setRecipient] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const balanceQuery = useQuery({
    queryKey: ['balance', chainId, token.address, owner],
    queryFn: () => readBalance({ client: publicClient, tokenAddress: token.address }, owner),
    refetchInterval: 20_000,
  })

  const amount = parseAmount(amountInput, token.decimals)
  const recipientError = addressInputError(recipient)
  const amountError = !amountInput
    ? undefined
    : amount === undefined
      ? invalidAmountMessage(amountInput, token.decimals)
      : open === 'transfer' && balanceQuery.data !== undefined && amount > balanceQuery.data
        ? 'More than your balance.'
        : undefined
  const canSubmit = Boolean(recipient && amount !== undefined && !recipientError && !amountError) && !isSubmitting

  const submit = async () => {
    if (!walletClient || amount === undefined) return
    setIsSubmitting(true)
    const toastId = toast.loading('Confirm in your wallet…')
    const tx = { walletClient, publicClient, tokenAddress: token.address }
    try {
      if (open === 'transfer') {
        await transfer(tx, recipient as `0x${string}`, amount)
        toast.success('Transfer sent.', { id: toastId })
      } else if (open === 'approve') {
        await approve(tx, recipient as `0x${string}`, amount)
        toast.success('Approval sent.', { id: toastId })
      }
      setAmountInput('')
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
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-text">{token.symbol}</span>
            {isTokenOwner && <Badge tone="positive">Owner</Badge>}
          </div>
          <div className="truncate text-xs text-text-muted">{token.name}</div>
          <div className="font-mono text-xs text-text-faint">
            {shortenAddress(token.address)} · {token.decimals} decimals
          </div>
        </div>
        <div className="text-right font-mono text-lg font-semibold text-text">
          {balanceQuery.data !== undefined ? formatAmount(balanceQuery.data, token.decimals) : '—'}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
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
        {isTokenOwner && (
          <Button variant="ghost" size="sm" onClick={() => navigate(`/manage?token=${token.address}`)}>
            <Settings2 className="h-3.5 w-3.5" />
            Manage
          </Button>
        )}
      </div>

      {open && (
        <div className="animate-scale-in mt-3 grid grid-cols-1 gap-3 rounded-xl bg-surface-raised p-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <Label>{open === 'transfer' ? 'Recipient' : 'Spender'}</Label>
            <Input
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.trim())}
              placeholder="0x…"
              className="font-mono"
            />
            <FieldHint error={recipientError} />
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              inputMode="decimal"
              placeholder="0.0"
              className="font-mono"
            />
            <FieldHint error={amountError} />
          </div>
          <div className="flex items-start sm:pt-[22px]">
            <Button onClick={submit} disabled={!canSubmit} className="w-full sm:w-auto">
              {isSubmitting && <Spinner className="h-4 w-4" />}
              {isSubmitting ? 'Sending…' : open === 'transfer' ? 'Send' : 'Approve'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
