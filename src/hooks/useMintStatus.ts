import { useQuery } from '@tanstack/react-query'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { deriveMintStatus, type MintStatus } from '../lib/mintStatus'
import { readMaxSupply, readMintLimits, readMintWindow, readOwner, readTotalSupply } from '../lib/reads/token'

export type { MintStatus }

/** Queries under this key prefix are invalidated after mints and setMintLimits. */
export const MINT_STATUS_KEY = 'mintStatus'

export function useMintStatus(tokenAddress: `0x${string}` | undefined) {
  const { address } = useWallet()
  const { publicClient, chainId } = useChain()

  return useQuery({
    queryKey: [MINT_STATUS_KEY, chainId, tokenAddress, address],
    enabled: Boolean(tokenAddress),
    refetchInterval: 15_000,
    queryFn: async (): Promise<MintStatus> => {
      const tokenRead = { client: publicClient, tokenAddress: tokenAddress! }
      const fetchedAt = Date.now()
      const [owner, totalSupply, maxSupply, limits, window] = await Promise.all([
        readOwner(tokenRead),
        readTotalSupply(tokenRead),
        readMaxSupply(tokenRead),
        readMintLimits(tokenRead),
        address ? readMintWindow(tokenRead, address) : Promise.resolve(undefined),
      ])

      return deriveMintStatus({ owner, account: address, totalSupply, maxSupply, limits, window, fetchedAt })
    },
  })
}
