import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { readFaucetAmountPerCall, readFaucetLimitPerPeriod } from '../lib/reads/factory'
import { readDecimals, readMintBudget } from '../lib/reads/token'
import { scaleWholeTokenAmount } from '../lib/units'

export type FaucetButtonState =
  | { status: 'no-wallet' }
  | { status: 'unlimited' }
  | { status: 'ready'; remainingFormatted: string }
  | { status: 'cooldown'; resetsAt: Date }

export function useMintBudget(tokenAddress: `0x${string}` | undefined) {
  const { address } = useWallet()
  const { publicClient, contracts, chainId } = useChain()

  const query = useQuery({
    queryKey: ['mintBudget', chainId, tokenAddress, address],
    enabled: Boolean(tokenAddress && address && contracts),
    refetchInterval: 15_000,
    queryFn: async () => {
      if (!tokenAddress || !address || !contracts) throw new Error('Not ready')
      const tokenRead = { client: publicClient, tokenAddress }
      const factoryRead = { client: publicClient, factoryAddress: contracts.tokenFactory }

      const [budget, decimals, faucetAmountPerCall, faucetLimitPerPeriod] = await Promise.all([
        readMintBudget(tokenRead, address),
        readDecimals(tokenRead),
        readFaucetAmountPerCall(factoryRead),
        readFaucetLimitPerPeriod(factoryRead),
      ])

      return {
        budget,
        decimals,
        faucetAmountScaled: scaleWholeTokenAmount(faucetAmountPerCall, decimals),
        limitScaled: scaleWholeTokenAmount(faucetLimitPerPeriod, decimals),
      }
    },
  })

  // Tick every second so an active countdown re-renders without a full refetch.
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const buttonState: FaucetButtonState = (() => {
    if (!address || !query.data) return { status: 'no-wallet' }
    const { budget, decimals, faucetAmountScaled } = query.data

    if (budget.unlimited) return { status: 'unlimited' }
    if (budget.remaining >= faucetAmountScaled) {
      return {
        status: 'ready',
        remainingFormatted: (Number(budget.remaining) / 10 ** decimals).toLocaleString(),
      }
    }
    if (budget.resetsAt === null) return { status: 'ready', remainingFormatted: '0' }
    return { status: 'cooldown', resetsAt: new Date(Number(budget.resetsAt) * 1000) }
  })()

  return { data: query.data, isLoading: query.isLoading, refetch: query.refetch, buttonState }
}
