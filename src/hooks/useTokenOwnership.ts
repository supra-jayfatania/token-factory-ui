import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { readTokensByCreator } from '../lib/reads/factory'
import { readOwner } from '../lib/reads/token'
import type { TokenInfo } from './useTokenList'

/**
 * Current owner() of each token, keyed by lowercase token address. Invalidate ['tokenOwners'] after ownership changes.
 *
 * The key holds the whole token list, so it changes whenever anyone creates a token; keepPreviousData
 * keeps the last map (instead of going back to a loading state) while the new one loads.
 */
export function useTokenOwners(tokens: TokenInfo[]) {
  const { publicClient, chainId } = useChain()
  const addresses = tokens.map((t) => t.address)

  const query = useQuery({
    queryKey: ['tokenOwners', chainId, addresses],
    enabled: addresses.length > 0,
    placeholderData: keepPreviousData,
    // Every Wallet/Manage visit would otherwise re-read owner() for every token.
    staleTime: 30_000,
    refetchInterval: (query) => (query.state.status === 'error' ? 15_000 : false),
    queryFn: async () => {
      const owners = await Promise.all(
        addresses.map((tokenAddress) => readOwner({ client: publicClient, tokenAddress })),
      )
      return Object.fromEntries(addresses.map((a, i) => [a.toLowerCase(), owners[i]])) as Record<string, `0x${string}`>
    },
  })

  return { owners: query.data ?? {}, isLoading: query.isLoading, isError: query.isError && !query.data }
}

/** Tokens the connected wallet created via the factory (getTokensByOwner) — regardless of who owns them now. */
export function useCreatedTokens() {
  const { address } = useWallet()
  const { publicClient, contracts, chainId } = useChain()

  const query = useQuery({
    queryKey: ['createdTokens', chainId, address],
    enabled: Boolean(address && contracts),
    queryFn: () =>
      readTokensByCreator({ client: publicClient, factoryAddress: contracts!.tokenFactory }, address!),
  })

  const created = new Set((query.data ?? []).map((a) => a.toLowerCase()))
  return { created, isLoading: query.isLoading }
}
