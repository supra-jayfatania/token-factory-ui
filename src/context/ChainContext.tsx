import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Chain } from 'viem'
import { supportedChains } from '../config/chains'
import { getContracts } from '../config/contracts'
import { getPublicClient } from '../lib/client'

type ChainState = {
  chainId: number
  setChainId: (id: number) => void
  chain: Chain
  publicClient: ReturnType<typeof getPublicClient>
  contracts: ReturnType<typeof getContracts>
}

const ChainContext = createContext<ChainState | undefined>(undefined)

/** Only mounted when at least one chain is configured — main.tsx shows a setup screen otherwise. */
export function ChainProvider({ children }: { children: ReactNode }) {
  const defaultChain = supportedChains[0]!
  const [chainId, setChainId] = useState<number>(defaultChain.id)

  const value = useMemo<ChainState>(() => {
    const chain = supportedChains.find((c) => c.id === chainId) ?? defaultChain
    return {
      chainId: chain.id,
      setChainId,
      chain,
      publicClient: getPublicClient(chain),
      contracts: getContracts(chain.id),
    }
  }, [chainId, defaultChain])

  return <ChainContext.Provider value={value}>{children}</ChainContext.Provider>
}

export function useChain(): ChainState {
  const ctx = useContext(ChainContext)
  if (!ctx) throw new Error('useChain must be used within a ChainProvider')
  return ctx
}
