import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useChain } from '../context/ChainContext'
import { readAllTokens, watchTokenCreated } from '../lib/reads/factory'
import { readDecimals, readSymbol } from '../lib/reads/token'

export type TokenInfo = {
  address: `0x${string}`
  symbol: string
  decimals: number
}

export function useTokenList() {
  const { publicClient, contracts, chainId } = useChain()
  const queryClient = useQueryClient()
  const queryKey = ['tokenList', chainId]

  const query = useQuery({
    queryKey,
    enabled: Boolean(contracts),
    queryFn: async (): Promise<TokenInfo[]> => {
      if (!contracts) return []
      const factoryRead = { client: publicClient, factoryAddress: contracts.tokenFactory }
      const addresses = await readAllTokens(factoryRead)
      const list = addresses.length ? addresses : contracts.seedTokens.map((t) => t.address)

      return Promise.all(
        list.map(async (address) => {
          const tokenRead = { client: publicClient, tokenAddress: address }
          const [symbol, decimals] = await Promise.all([
            readSymbol(tokenRead),
            readDecimals(tokenRead),
          ])
          return { address, symbol, decimals }
        }),
      )
    },
  })

  // Learn about newly created tokens live via TokenCreated rather than re-polling allTokens().
  useEffect(() => {
    if (!contracts) return
    const unwatch = watchTokenCreated(
      { client: publicClient, factoryAddress: contracts.tokenFactory },
      () => {
        queryClient.invalidateQueries({ queryKey })
      },
    )
    return () => unwatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts, publicClient, chainId])

  return {
    tokens: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
