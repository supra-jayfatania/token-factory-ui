import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { useChain } from '../context/ChainContext'
import { readAllTokensLength, readTokenAt } from '../lib/reads/factory'
import { readDecimals, readName, readSymbol } from '../lib/reads/token'

export type TokenInfo = {
  address: `0x${string}`
  name: string
  symbol: string
  decimals: number
}

/**
 * Every token the factory has ever created, newest first. The doc lists no
 * creation event, so new tokens are discovered by polling allTokensLength();
 * each index → address and each address → name/symbol/decimals is immutable,
 * so those are cached forever (staleTime + gcTime Infinity) and only new
 * entries cost RPC calls.
 *
 * A token whose metadata can't be read is left out rather than failing the
 * whole list; it's retried on the next list fetch.
 */
export function useTokenList() {
  const { publicClient, contracts, chainId } = useChain()
  const queryClient = useQueryClient()

  const countQuery = useQuery({
    queryKey: ['tokenCount', chainId],
    enabled: Boolean(contracts),
    refetchInterval: 15_000,
    queryFn: () => readAllTokensLength({ client: publicClient, factoryAddress: contracts!.tokenFactory }),
  })
  const count = countQuery.data

  const listQuery = useQuery({
    queryKey: ['tokenList', chainId, count?.toString()],
    enabled: Boolean(contracts) && count !== undefined,
    placeholderData: keepPreviousData,
    // Nothing else re-runs this query while the count stays the same, so keep retrying after an error.
    refetchInterval: (query) => (query.state.status === 'error' ? 15_000 : false),
    queryFn: async (): Promise<TokenInfo[]> => {
      const factoryRead = { client: publicClient, factoryAddress: contracts!.tokenFactory }
      const indexes = Array.from({ length: Number(count) }, (_, i) => BigInt(i))

      const addresses = await Promise.all(
        indexes.map((index) =>
          queryClient.fetchQuery({
            queryKey: ['tokenAt', chainId, index.toString()],
            staleTime: Infinity,
            gcTime: Infinity,
            queryFn: () => readTokenAt(factoryRead, index),
          }),
        ),
      )

      const results = await Promise.allSettled(
        addresses.map((address) =>
          queryClient.fetchQuery({
            queryKey: ['tokenMeta', chainId, address],
            staleTime: Infinity,
            gcTime: Infinity,
            queryFn: async (): Promise<TokenInfo> => {
              const tokenRead = { client: publicClient, tokenAddress: address }
              const [name, symbol, decimals] = await Promise.all([
                readName(tokenRead),
                readSymbol(tokenRead),
                readDecimals(tokenRead),
              ])
              return { address, name, symbol, decimals }
            },
          }),
        ),
      )
      const tokens = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
      return tokens.reverse()
    },
  })

  const tokens = listQuery.data ?? []
  return {
    tokens,
    isLoading: countQuery.isLoading || listQuery.isLoading,
    /** True only when there's nothing to show — a failed background refresh keeps the last list. */
    isError: tokens.length === 0 && (countQuery.isError || listQuery.isError),
  }
}
