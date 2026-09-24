import { useQuery } from '@tanstack/react-query'
import { Sliders } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '../components/EmptyState'
import { PageHeading } from '../components/PageHeading'
import { TokenAvatar } from '../components/TokenAvatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardDescription, CardTitle } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { Spinner } from '../components/ui/Spinner'
import { Switch } from '../components/ui/Switch'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { useRole } from '../hooks/useRole'
import { useTokenList } from '../hooks/useTokenList'
import { describeContractError } from '../lib/errors'
import {
  readFaucetAmountPerCall,
  readFaucetLimitPerPeriod,
  readFaucetPeriod,
  readMintingPaused,
  readTokenPaused,
} from '../lib/reads/factory'
import { setFaucetConfig, setMintingPaused, setTokenPaused } from '../lib/tx/factory'

export function AdminMintControls() {
  const { address, walletClient } = useWallet()
  const { publicClient, contracts, chainId } = useChain()
  const { isMasterOwner, isLoading: roleLoading } = useRole()
  const { tokens } = useTokenList()

  const configQuery = useQuery({
    queryKey: ['faucetConfig', chainId],
    enabled: Boolean(contracts),
    queryFn: async () => {
      const factoryRead = { client: publicClient, factoryAddress: contracts!.tokenFactory }
      const [amountPerCall, limitPerPeriod, period, mintingPaused] = await Promise.all([
        readFaucetAmountPerCall(factoryRead),
        readFaucetLimitPerPeriod(factoryRead),
        readFaucetPeriod(factoryRead),
        readMintingPaused(factoryRead),
      ])
      return { amountPerCall, limitPerPeriod, period, mintingPaused }
    },
  })

  const [amountPerCall, setAmountPerCall] = useState('')
  const [limitPerPeriod, setLimitPerPeriod] = useState('')
  const [periodSeconds, setPeriodSeconds] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTogglingGlobal, setIsTogglingGlobal] = useState(false)

  if (!address) return <EmptyState text="Connect a wallet to continue." />
  if (roleLoading) return <EmptyState text="Checking access…" />
  if (!isMasterOwner) {
    return <EmptyState text="Only a master owner can manage mint controls. This wallet isn't one." />
  }

  const submitFaucetConfig = async () => {
    if (!walletClient || !contracts) return
    const amount = BigInt(amountPerCall || '0')
    const limit = BigInt(limitPerPeriod || '0')
    const period = BigInt(periodSeconds || '0')
    if (amount <= 0n) return toast.error('Enter an amount greater than zero.')
    if (limit <= 0n) return toast.error('Enter a limit greater than zero.')
    if (period <= 0n) return toast.error('Enter a period greater than zero.')

    setIsSubmitting(true)
    const toastId = toast.loading('Updating faucet config…')
    try {
      await setFaucetConfig(
        { walletClient, publicClient, factoryAddress: contracts.tokenFactory },
        amount,
        limit,
        period,
      )
      toast.success('Faucet config updated.', { id: toastId })
      configQuery.refetch()
    } catch (error) {
      toast.error(describeContractError(error), { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleGlobalPause = async () => {
    if (!walletClient || !contracts || configQuery.data === undefined) return
    setIsTogglingGlobal(true)
    const toastId = toast.loading('Updating…')
    try {
      await setMintingPaused(
        { walletClient, publicClient, factoryAddress: contracts.tokenFactory },
        !configQuery.data.mintingPaused,
      )
      toast.success('Global pause updated.', { id: toastId })
      configQuery.refetch()
    } catch (error) {
      toast.error(describeContractError(error), { id: toastId })
    } finally {
      setIsTogglingGlobal(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading icon={Sliders} title="Admin: mint controls" subtitle="Master owner only." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Global pause</CardTitle>
              <CardDescription className="mt-0.5">
                Stops minting and faucet claims for every token, including for master owners.
              </CardDescription>
            </div>
            {isTogglingGlobal ? (
              <Spinner className="h-4 w-4 text-text-muted" />
            ) : (
              <Switch
                checked={!configQuery.data?.mintingPaused}
                onChange={toggleGlobalPause}
                label="Global minting active"
              />
            )}
          </div>
          {configQuery.data?.mintingPaused && (
            <Badge tone="negative" className="mt-3">
              Minting is currently paused factory-wide
            </Badge>
          )}
        </Card>

        <Card>
          <CardTitle className="mb-3">Per-token pause</CardTitle>
          <div className="space-y-1.5">
            {tokens.map((token) => (
              <TokenPauseRow key={token.address} tokenAddress={token.address} symbol={token.symbol} />
            ))}
            {tokens.length === 0 && <p className="text-sm text-text-muted">No tokens yet.</p>}
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <CardTitle>Faucet config</CardTitle>
        <CardDescription className="mb-4">
          Currently{' '}
          <span className="font-mono text-text">{configQuery.data?.amountPerCall.toString() ?? '—'}</span>{' '}
          tokens/call ·{' '}
          <span className="font-mono text-text">{configQuery.data?.limitPerPeriod.toString() ?? '—'}</span>{' '}
          tokens/period ·{' '}
          <span className="font-mono text-text">{configQuery.data?.period.toString() ?? '—'}</span>s window
        </CardDescription>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label>Amount per call</Label>
            <Input
              value={amountPerCall}
              onChange={(e) => setAmountPerCall(e.target.value)}
              placeholder="100"
              className="font-mono"
            />
          </div>
          <div>
            <Label>Limit per period</Label>
            <Input
              value={limitPerPeriod}
              onChange={(e) => setLimitPerPeriod(e.target.value)}
              placeholder="1000"
              className="font-mono"
            />
          </div>
          <div>
            <Label>Period (seconds)</Label>
            <Input
              value={periodSeconds}
              onChange={(e) => setPeriodSeconds(e.target.value)}
              placeholder="3600"
              className="font-mono"
            />
          </div>
        </div>
        <Button className="mt-4 w-full sm:w-auto" onClick={submitFaucetConfig} disabled={isSubmitting}>
          {isSubmitting && <Spinner className="h-4 w-4" />}
          {isSubmitting ? 'Updating…' : 'Update faucet config'}
        </Button>
      </Card>
    </div>
  )
}

function TokenPauseRow({
  tokenAddress,
  symbol,
}: {
  tokenAddress: `0x${string}`
  symbol: string
}) {
  const { publicClient, contracts, chainId } = useChain()
  const { walletClient } = useWallet()
  const [isToggling, setIsToggling] = useState(false)

  const pausedQuery = useQuery({
    queryKey: ['tokenPaused', chainId, tokenAddress],
    enabled: Boolean(contracts),
    queryFn: () =>
      readTokenPaused({ client: publicClient, factoryAddress: contracts!.tokenFactory }, tokenAddress),
  })

  const toggle = async () => {
    if (!walletClient || !contracts || pausedQuery.data === undefined) return
    setIsToggling(true)
    const toastId = toast.loading('Updating…')
    try {
      await setTokenPaused(
        { walletClient, publicClient, factoryAddress: contracts.tokenFactory },
        tokenAddress,
        !pausedQuery.data,
      )
      toast.success(`${symbol} updated.`, { id: toastId })
      pausedQuery.refetch()
    } catch (error) {
      toast.error(describeContractError(error), { id: toastId })
    } finally {
      setIsToggling(false)
    }
  }

  if (pausedQuery.isLoading) return <Skeleton className="h-12 w-full" />

  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-raised px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <TokenAvatar address={tokenAddress} symbol={symbol} size="sm" />
        <span className="text-sm font-medium text-text">{symbol}</span>
        <Badge tone={pausedQuery.data ? 'negative' : 'positive'}>
          {pausedQuery.data ? 'Paused' : 'Active'}
        </Badge>
      </div>
      {isToggling ? (
        <Spinner className="h-4 w-4 text-text-muted" />
      ) : (
        <Switch checked={!pausedQuery.data} onChange={toggle} label={`${symbol} minting active`} />
      )}
    </div>
  )
}
