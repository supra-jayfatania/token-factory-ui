import { Clock, Droplet, PauseCircle, Repeat } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { BudgetCountdown } from '../components/BudgetCountdown'
import { InfoStrip } from '../components/InfoStrip'
import { PageHeading } from '../components/PageHeading'
import { TokenPicker } from '../components/TokenPicker'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { Spinner } from '../components/ui/Spinner'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { useMintBudget } from '../hooks/useMintBudget'
import { useTokenList } from '../hooks/useTokenList'
import { describeContractError } from '../lib/errors'
import { getFaucet } from '../lib/tx/token'

export function Faucet() {
  const { address, walletClient } = useWallet()
  const { publicClient } = useChain()
  const { tokens, isLoading: tokensLoading } = useTokenList()
  const [selected, setSelected] = useState<`0x${string}` | undefined>(undefined)
  const [isClaiming, setIsClaiming] = useState(false)

  const tokenAddress = selected ?? tokens[0]?.address
  const { buttonState, refetch, data, isLoading: budgetLoading } = useMintBudget(tokenAddress)

  const claim = async () => {
    if (!walletClient || !tokenAddress) return
    setIsClaiming(true)
    const toastId = toast.loading('Confirm the transaction in your wallet…')
    try {
      await getFaucet({ walletClient, publicClient, tokenAddress })
      toast.success('Tokens claimed.', { id: toastId })
      refetch()
    } catch (error) {
      toast.error(describeContractError(error), { id: toastId })
    } finally {
      setIsClaiming(false)
    }
  }

  const progressPct =
    data && !data.budget.unlimited && data.limitScaled > 0n
      ? Math.min(100, (Number(data.budget.remaining) / Number(data.limitScaled)) * 100)
      : 100

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeading
        icon={Droplet}
        title="Get free tokens"
        subtitle="Anyone can claim — mint and faucet share one rolling budget per wallet, per token."
        align="center"
      />

      <Card className="mx-auto max-w-md">
        <div className="space-y-4">
          {tokensLoading ? (
            <Skeleton className="h-14 w-full" />
          ) : (
            <TokenPicker tokens={tokens} value={tokenAddress} onChange={setSelected} />
          )}

          {!address && (
            <p className="rounded-lg border border-dashed border-border px-3 py-3 text-center text-sm text-text-muted">
              Connect a wallet to see your budget.
            </p>
          )}

          {address && tokenAddress && budgetLoading && <Skeleton className="h-20 w-full" />}

          {address && tokenAddress && !budgetLoading && (
            <div className="rounded-xl border border-border bg-surface-raised p-3.5">
              {buttonState.status === 'unlimited' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Budget this period</span>
                  <Badge tone="positive">Unlimited (master owner)</Badge>
                </div>
              )}

              {buttonState.status === 'ready' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Remaining this period</span>
                    <span className="font-mono font-medium text-text">
                      {buttonState.remainingFormatted}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-accent transition-[width]"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {buttonState.status === 'cooldown' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Budget used</span>
                  <Badge tone="warning">
                    Resets in <BudgetCountdown resetsAt={buttonState.resetsAt} />
                  </Badge>
                </div>
              )}
            </div>
          )}

          <Button
            className="w-full"
            size="lg"
            onClick={claim}
            disabled={
              !address ||
              !tokenAddress ||
              isClaiming ||
              buttonState.status === 'cooldown' ||
              tokensLoading
            }
          >
            {isClaiming && <Spinner className="h-4 w-4" />}
            {isClaiming ? 'Claiming…' : 'Claim tokens'}
          </Button>
        </div>
      </Card>

      <InfoStrip
        tiles={[
          {
            icon: Repeat,
            title: 'Shared budget',
            description: 'Minting and claiming from the faucet draw from the same rolling budget per wallet, per token — not separate allowances.',
          },
          {
            icon: Clock,
            title: 'Rolling window',
            description: "The reset timer starts on your first claim and runs for the token's faucet period — there's no fixed top-of-the-hour.",
          },
          {
            icon: PauseCircle,
            title: 'Pause-safe',
            description: 'If minting is paused, your spent budget is preserved and the window keeps ticking — nothing resets early.',
          },
        ]}
      />
    </div>
  )
}
