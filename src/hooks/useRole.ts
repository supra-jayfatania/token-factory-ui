import { useQuery } from '@tanstack/react-query'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { readIsMasterOwner, readIsSubOwner } from '../lib/reads/factory'

export function useRole() {
  const { address } = useWallet()
  const { publicClient, contracts, chainId } = useChain()

  const query = useQuery({
    queryKey: ['role', chainId, address],
    enabled: Boolean(address && contracts),
    queryFn: async () => {
      if (!address || !contracts) throw new Error('Not ready')
      const factoryRead = { client: publicClient, factoryAddress: contracts.tokenFactory }
      const [isMasterOwner, isSubOwner] = await Promise.all([
        readIsMasterOwner(factoryRead, address),
        readIsSubOwner(factoryRead, address),
      ])
      return { isMasterOwner, isSubOwner }
    },
  })

  return {
    isMasterOwner: query.data?.isMasterOwner ?? false,
    isSubOwner: query.data?.isSubOwner ?? false,
    canCreateToken: Boolean(query.data?.isMasterOwner || query.data?.isSubOwner),
    isLoading: query.isLoading,
  }
}
