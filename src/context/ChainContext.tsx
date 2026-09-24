import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { sepolia } from 'viem/chains'
import { supportedChains } from '../config/chains'
import { getContracts } from '../config/contracts'
import { getPublicClient } from '../lib/client'

type ChainState = {
  chainId: number
  setChainId: (id: number) => void
  chain: (typeof supportedChains)[number]
  publicClient: ReturnType<typeof getPublicClient>
  contracts: ReturnType<typeof getContracts>
}

const ChainContext = createContext<ChainState | undefined>(undefined)

export function ChainProvider({ children }: { children: ReactNode }) {
  const [chainId, setChainId] = useState<number>(sepolia.id)

  const value = useMemo<ChainState>(() => {
    const chain = supportedChains.find((c) => c.id === chainId) ?? sepolia
    return {
      chainId: chain.id,
      setChainId,
      chain,
      publicClient: getPublicClient(chain),
      contracts: getContracts(chain.id),
    }
  }, [chainId])

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>
}

export function useChain(): ChainState {
  const ctx = useContext(ChainContext)
  if (!ctx) throw new Error('useChain must be used within a ChainProvider')
  return ctx
}
