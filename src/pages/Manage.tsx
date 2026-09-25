import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { isAddress, zeroAddress } from 'viem'
import { EmptyState } from '../components/EmptyState'
import { FieldHint, MintLimitsFields } from '../components/MintLimitsFields'
import { PageHeading } from '../components/PageHeading'
import { TokenPicker } from '../components/TokenPicker'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardDescription, CardTitle } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { Spinner } from '../components/ui/Spinner'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { MINT_STATUS_KEY, useMintStatus, type MintStatus } from '../hooks/useMintStatus'
import { useTokenList, type TokenInfo } from '../hooks/useTokenList'
import { useTokenOwners } from '../hooks/useTokenOwnership'
import { useTokenParam } from '../hooks/useTokenParam'
import { describeContractError } from '../lib/errors'
import { sameAddress, shortenAddress } from '../lib/identicon'
import { mintLimitsToInput, validateMintLimits, type MintLimitsInput } from '../lib/mintLimitsForm'
import { renounceOwnership, setMintLimits, transferOwnership } from '../lib/tx/token'
import { formatAmount, formatDuration } from '../lib/units'

export function Manage() {
  const { address } = useWallet()
  const { tokens, isLoading: tokensLoading, isError: tokensError } = useTokenList()
  const { owners, isLoading: ownersLoading, isError: ownersError } = useTokenOwners(tokens)
  const ownerOf = (t: TokenInfo) => owners[t.address.toLowerCase()]
  const owned = tokens.filter((t) => sameAddress(ownerOf(t), address))
  const { param, selected, setToken } = useTokenParam(tokens, owned[0])

  if (!address) return <EmptyState icon={Settings2} text="Connect a wallet to manage the tokens you own." />
  if (tokensLoading || ownersLoading) return <Skeleton className="mx-auto h-64 max-w-3xl rounded-2xl" />
  if (tokensError || ownersError) {
    return <EmptyState icon={Settings2} text="Couldn't load the factory's tokens or their owners. Retrying…" />
  }

  // Only call a requested token "not yours" once its owner has been read — a just-created token
  // shows up in the list a moment before its owner() does.
  const selectedOwner = selected ? ownerOf(selected) : undefined
  const requestedNotOwned = Boolean(param) && selectedOwner !== undefined && !sameAddress(selectedOwner, address)
  const token = selected && owned.includes(selected) ? selected : owned[0]

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        icon={Settings2}
        title="Manage tokens"
        subtitle="Owner-only settings for the tokens this wallet currently owns."
        action={<Badge>{owned.length} owned</Badge>}
      />

      {requestedNotOwned && (
        <p className="mb-4 rounded-lg border border-border bg-surface-raised p-3 text-sm text-text-muted">
          This wallet isn't the owner of {selected?.symbol}, so it can't change its settings.
        </p>
      )}

      {owned.length === 0 ? (
        <EmptyState
          icon={Settings2}
          text="This wallet doesn't own any factory tokens. Create one, or have an owner transfer ownership to you."
        />
      ) : (
        <div className="space-y-4">
          <TokenPicker tokens={owned} value={token?.address} onChange={setToken} />
          {token && <TokenAdmin key={token.address} token={token} />}
        </div>
      )}
    </div>
  )
}

function TokenAdmin({ token }: { token: TokenInfo }) {
  const statusQuery = useMintStatus(token.address)
  const status = statusQuery.data

  if (statusQuery.isLoading) return <Skeleton className="h-64 w-full rounded-2xl" />
  if (!status) return <p className="text-sm text-negative">Couldn't load this token's settings.</p>
  if (!status.isOwner) {
    return <EmptyState text={`This wallet is no longer the owner of ${token.symbol}.`} />
  }

  return (
    <>
      <MintLimitsCard token={token} status={status} />
      <OwnerMintCard token={token} status={status} />
      <TransferOwnershipCard token={token} currentOwner={status.owner} />
      <RenounceOwnershipCard token={token} />
    </>
  )
}

function useTokenTx(token: TokenInfo) {
  const { walletClient } = useWallet()
  const { publicClient } = useChain()
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)

  const run = async (label: string, action: (tx: Parameters<typeof setMintLimits>[0]) => Promise<unknown>) => {
    if (!walletClient) return false
    setPending(true)
    const toastId = toast.loading('Confirm the transaction in your wallet…')
    try {
      await action({ walletClient, publicClient, tokenAddress: token.address })
      toast.success(label, { id: toastId })
      queryClient.invalidateQueries({ queryKey: [MINT_STATUS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['tokenOwners'] })
      return true
    } catch (error) {
      toast.error(describeContractError(error), { id: toastId })
      return false
    } finally {
      setPending(false)
    }
  }

  return { run, pending }
}

function MintLimitsCard({ token, status }: { token: TokenInfo; status: MintStatus }) {
  const { limits } = status
  const initial = mintLimitsToInput(limits, token.decimals)
  const [input, setInput] = useState<MintLimitsInput>(initial)
  const { run, pending } = useTokenTx(token)
  const { limits: next, errors } = validateMintLimits(input, token.decimals)

  const unchanged =
    next !== undefined &&
    next.period === limits.period &&
    next.capPerPeriod === limits.capPerPeriod &&
    next.capPerRequest === limits.capPerRequest

  const fmt = (v: bigint) => `${formatAmount(v, token.decimals)} ${token.symbol}`

  return (
    <Card>
      <CardTitle>Public mint limits</CardTitle>
      <CardDescription className="mb-4">
        Currently {fmt(limits.capPerRequest)} per request, {fmt(limits.capPerPeriod)} per{' '}
        {formatDuration(Number(limits.period))}. All three are replaced together; you're exempt as owner.
      </CardDescription>
      <MintLimitsFields value={input} onChange={setInput} errors={errors} symbol={token.symbol} disabled={pending} />
      <div className="mt-4 flex gap-2">
        <Button
          onClick={() =>
            next && run('Mint limits updated.', (tx) => setMintLimits(tx, next.period, next.capPerPeriod, next.capPerRequest))
          }
          disabled={!next || unchanged || pending}
        >
          {pending && <Spinner className="h-4 w-4" />}
          {pending ? 'Saving…' : 'Save limits'}
        </Button>
        <Button variant="ghost" onClick={() => setInput(initial)} disabled={pending}>
          Reset
        </Button>
      </div>
    </Card>
  )
}

function OwnerMintCard({ token, status }: { token: TokenInfo; status: MintStatus }) {
  const navigate = useNavigate()
  const fmt = (v: bigint) => formatAmount(v, token.decimals)
  return (
    <Card className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <CardTitle>Owner minting</CardTitle>
        <CardDescription>
          {status.supplyLeft === undefined
            ? 'You can mint any amount — this token has no max supply.'
            : `You can mint up to ${fmt(status.supplyLeft)} ${token.symbol} more (max supply ${fmt(status.maxSupply)}).`}
        </CardDescription>
      </div>
      <Button variant="secondary" onClick={() => navigate(`/?token=${token.address}`)}>
        Mint {token.symbol}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Card>
  )
}

function TransferOwnershipCard({ token, currentOwner }: { token: TokenInfo; currentOwner: `0x${string}` }) {
  const [newOwner, setNewOwner] = useState('')
  const [confirming, setConfirming] = useState(false)
  const { run, pending } = useTokenTx(token)

  const error = !newOwner
    ? undefined
    : !isAddress(newOwner)
      ? 'Enter a valid address.'
      : newOwner === zeroAddress
        ? 'Use "Renounce ownership" below to give up ownership entirely.'
        : sameAddress(newOwner, currentOwner)
          ? 'That address already owns this token.'
          : undefined

  const submit = async () => {
    const ok = await run(`Ownership of ${token.symbol} transferred.`, (tx) =>
      transferOwnership(tx, newOwner as `0x${string}`),
    )
    if (ok) setNewOwner('')
    setConfirming(false)
  }

  return (
    <Card>
      <CardTitle>Transfer ownership</CardTitle>
      <CardDescription className="mb-4">
        The new owner gets rate-limit exemption and these settings. You lose both immediately.
      </CardDescription>
      <Label>New owner</Label>
      <Input
        value={newOwner}
        onChange={(e) => {
          setNewOwner(e.target.value.trim())
          setConfirming(false)
        }}
        placeholder="0x…"
        className="font-mono"
        disabled={pending}
      />
      <FieldHint error={error} />
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!confirming ? (
          <Button variant="secondary" onClick={() => setConfirming(true)} disabled={!newOwner || Boolean(error) || pending}>
            Transfer ownership
          </Button>
        ) : (
          <>
            <span className="text-sm text-text-muted">
              Hand {token.symbol} to {shortenAddress(newOwner)}?
            </span>
            <Button variant="danger" onClick={submit} disabled={pending}>
              {pending && <Spinner className="h-4 w-4" />}
              Confirm transfer
            </Button>
            <Button variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}

function RenounceOwnershipCard({ token }: { token: TokenInfo }) {
  const [typed, setTyped] = useState('')
  const { run, pending } = useTokenTx(token)

  return (
    <Card className="border-negative/30">
      <CardTitle className="flex items-center gap-2 text-negative">
        <AlertTriangle className="h-4 w-4" />
        Renounce ownership
      </CardTitle>
      <CardDescription className="mb-4">
        Permanently sets the owner to the zero address. Nobody will be exempt from the rate limits and the
        limits can never be changed again. This can't be undone.
      </CardDescription>
      <Label>
        Type <span className="font-mono normal-case text-text">{token.symbol}</span> to confirm
      </Label>
      <div className="flex gap-2">
        <Input value={typed} onChange={(e) => setTyped(e.target.value)} className="font-mono" disabled={pending} />
        <Button
          variant="danger"
          onClick={() => run(`Ownership of ${token.symbol} renounced.`, renounceOwnership)}
          disabled={typed !== token.symbol || pending}
        >
          {pending && <Spinner className="h-4 w-4" />}
          Renounce
        </Button>
      </div>
    </Card>
  )
}
