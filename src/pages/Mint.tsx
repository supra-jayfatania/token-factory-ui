import { useQueryClient } from '@tanstack/react-query'
import { Clock, Crown, Gauge, Sparkles } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { formatUnits } from 'viem'
import { Countdown } from '../components/Countdown'
import { InfoStrip } from '../components/InfoStrip'
import { FieldHint } from '../components/MintLimitsFields'
import { PageHeading } from '../components/PageHeading'
import { TokenPicker } from '../components/TokenPicker'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { Spinner } from '../components/ui/Spinner'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { MINT_STATUS_KEY, useMintStatus, type MintStatus } from '../hooks/useMintStatus'
import { useTokenList, type TokenInfo } from '../hooks/useTokenList'
import { useTokenParam } from '../hooks/useTokenParam'
import { describeContractError } from '../lib/errors'
import { addressInputError, shortenAddress } from '../lib/identicon'
import { mint } from '../lib/tx/token'
import { formatAmount, formatDuration, invalidAmountMessage, parseAmount } from '../lib/units'

export function Mint() {
  const { tokens, isLoading: tokensLoading, isError: tokensError } = useTokenList()
  const { param, selected: token, setToken } = useTokenParam(tokens, tokens[0])
  // A ?token= that isn't in the list is shown as such, never swapped for another token.
  const unknownToken = Boolean(param) && !token && !tokensLoading && !tokensError

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        icon={Sparkles}
        title="Mint tokens"
        subtitle="Anyone can mint any factory token — non-owners are rate-limited per request and per time window."
        align="center"
      />

      <Card className="mx-auto max-w-lg">
        <div className="space-y-4">
          {tokensLoading ? (
            <Skeleton className="h-14 w-full" />
          ) : tokensError ? (
            <p className="text-sm text-negative">Couldn't load the factory's tokens. Retrying…</p>
          ) : (
            <TokenPicker tokens={tokens} value={token?.address} onChange={setToken} />
          )}
          {unknownToken && (
            <p className="rounded-lg border border-border bg-surface-raised p-3 text-sm text-text-muted">
              No factory token found at <span className="font-mono">{shortenAddress(param!)}</span>. If it was
              just created it will show up within a few seconds — or pick a token above.
            </p>
          )}
          {/* Keyed so the form resets when switching tokens (amounts are per-token decimals). */}
          {token && <MintForm key={token.address} token={token} />}
        </div>
      </Card>

      <InfoStrip
        tiles={[
          {
            icon: Gauge,
            title: 'Two caps',
            description:
              'Each mint call is capped per request, and your running total is capped per window. Both are set by the token owner.',
          },
          {
            icon: Clock,
            title: 'Your own window',
            description:
              'Your window starts with your first mint and lasts the token\'s mint period. The limit counts against whoever calls mint, not the recipient.',
          },
          {
            icon: Crown,
            title: 'Owner exempt',
            description: "The token's owner mints with no rate limit — but nobody, owner included, can mint past max supply.",
          },
        ]}
      />
    </div>
  )
}

function MintForm({ token }: { token: TokenInfo }) {
  const { address, walletClient } = useWallet()
  const { publicClient } = useChain()
  const queryClient = useQueryClient()
  const statusQuery = useMintStatus(token.address)
  const status = statusQuery.data

  const [recipient, setRecipient] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [isMinting, setIsMinting] = useState(false)

  if (statusQuery.isLoading) return <Skeleton className="h-40 w-full" />
  if (!status) {
    return <p className="text-sm text-negative">Couldn't load this token's mint settings.</p>
  }

  const amount = parseAmount(amountInput, token.decimals)
  const amountError = amountInput ? describeAmountProblem(amountInput, amount, status, token) : undefined
  const recipientError = addressInputError(recipient)

  const canSubmit =
    Boolean(address && walletClient) && amount !== undefined && amount > 0n && !amountError && !recipientError && !isMinting

  const submit = async () => {
    if (!walletClient || !address || amount === undefined) return
    const to = (recipient || address) as `0x${string}`
    setIsMinting(true)
    const toastId = toast.loading('Confirm the transaction in your wallet…')
    try {
      await mint({ walletClient, publicClient, tokenAddress: token.address }, to, amount)
      toast.success(`Minted ${formatAmount(amount, token.decimals)} ${token.symbol}.`, { id: toastId })
      setAmountInput('')
      queryClient.invalidateQueries({ queryKey: [MINT_STATUS_KEY] })
      queryClient.invalidateQueries({ queryKey: ['balance'] })
    } catch (error) {
      toast.error(describeContractError(error), { id: toastId })
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <>
      <MintStatusPanel status={status} token={token} onWindowReset={() => statusQuery.refetch()} />

      <div>
        <Label>Recipient</Label>
        <Input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value.trim())}
          placeholder={address ? `Your wallet (${shortenAddress(address)})` : '0x…'}
          className="font-mono"
          disabled={!address}
        />
        <FieldHint error={recipientError} hint="Leave empty to mint to yourself." />
      </div>

      <div>
        <Label>Amount</Label>
        <div className="flex gap-2">
          <Input
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            inputMode="decimal"
            placeholder="0.0"
            className="font-mono"
            disabled={!address}
          />
          {status.maxMintNow !== undefined && status.maxMintNow > 0n && (
            <Button
              variant="secondary"
              onClick={() => setAmountInput(formatUnits(status.maxMintNow!, token.decimals))}
              disabled={!address}
            >
              Max
            </Button>
          )}
        </div>
        <FieldHint
          error={amountError}
          hint={
            !address
              ? undefined
              : status.maxMintNow === undefined
                ? 'No limit applies to you on this token.'
                : `You can mint up to ${formatAmount(status.maxMintNow, token.decimals)} ${token.symbol} right now.`
          }
        />
      </div>

      <Button className="w-full" size="lg" onClick={submit} disabled={!canSubmit}>
        {isMinting && <Spinner className="h-4 w-4" />}
        {!address ? 'Connect a wallet to mint' : isMinting ? 'Minting…' : `Mint ${token.symbol}`}
      </Button>
    </>
  )
}

/** Explains which limit an amount breaks, most permanent first. Returns undefined when the amount is fine. */
function describeAmountProblem(
  input: string,
  amount: bigint | undefined,
  status: MintStatus,
  token: TokenInfo,
): string | undefined {
  const fmt = (v: bigint) => `${formatAmount(v, token.decimals)} ${token.symbol}`
  if (amount === undefined) return invalidAmountMessage(input, token.decimals)
  if (amount === 0n) return 'Enter an amount greater than zero.'
  if (status.supplyLeft !== undefined && amount > status.supplyLeft) {
    return status.supplyLeft === 0n ? 'Max supply reached — nothing more can be minted.' : `Only ${fmt(status.supplyLeft)} left before max supply.`
  }
  if (status.isOwner || !status.window) return undefined
  if (amount > status.limits.capPerRequest) return `Max per request is ${fmt(status.limits.capPerRequest)}.`
  if (amount > status.window.remainingInWindow) {
    return status.window.remainingInWindow === 0n
      ? "You've used this window's cap — wait for it to reset."
      : `Only ${fmt(status.window.remainingInWindow)} left in your current window.`
  }
  return undefined
}

function MintStatusPanel({
  status,
  token,
  onWindowReset,
}: {
  status: MintStatus
  token: TokenInfo
  onWindowReset: () => void
}) {
  const { address } = useWallet()
  const fmt = (v: bigint) => formatAmount(v, token.decimals)
  const { limits, window } = status
  const usedPct =
    window && limits.capPerPeriod > 0n
      ? Math.min(100, Number((window.mintedInWindow * 10_000n) / limits.capPerPeriod) / 100)
      : 0

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface-raised p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">Your access</span>
        {!address ? (
          <Badge>Connect a wallet</Badge>
        ) : status.isOwner ? (
          <Badge tone="positive">Owner — no rate limit</Badge>
        ) : (
          <Badge>Rate-limited</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label="Per request">
          {fmt(limits.capPerRequest)} {token.symbol}
        </Stat>
        <Stat label={`Per ${formatDuration(Number(limits.period))}`}>
          {fmt(limits.capPerPeriod)} {token.symbol}
        </Stat>
        <Stat label="Total supply">{fmt(status.totalSupply)}</Stat>
        <Stat label="Max supply">{status.maxSupply > 0n ? fmt(status.maxSupply) : 'No cap'}</Stat>
      </div>

      {address && !status.isOwner && window && (
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Minted this window</span>
            <span className="font-mono text-text">
              {fmt(window.mintedInWindow)} / {fmt(limits.capPerPeriod)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className={`h-full rounded-full transition-[width] ${usedPct >= 100 ? 'bg-warning' : 'bg-accent'}`}
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <p className="text-xs text-text-faint">
            {status.resetsAtMs ? (
              <>
                Resets in <Countdown targetMs={status.resetsAtMs} onElapsed={onWindowReset} />
              </>
            ) : (
              'No window open — your next mint starts a new one.'
            )}
          </p>
        </div>
      )}
    </div>
  )
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-surface px-3 py-2">
      <div className="text-[11px] font-semibold tracking-wide text-text-faint uppercase">{label}</div>
      <div className="truncate font-mono text-sm text-text">{children}</div>
    </div>
  )
}
