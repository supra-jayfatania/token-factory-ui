import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createWalletClient, custom, type WalletClient } from 'viem'
import { supportedChains } from '../config/chains'
import type { WalletOption } from '../hooks/useWalletOptions'
import type { Eip1193Provider } from '../lib/wallet/types'

type WalletState = {
  address: `0x${string}` | undefined
  chainId: number | undefined
  activeWalletId: string | undefined
  isConnecting: boolean
  connect: (option: WalletOption) => Promise<void>
  /** Resolves to whether the wallet itself also revoked the site's permission (not all wallets support this — see body). */
  disconnect: () => Promise<boolean>
  switchChain: (chainId: number) => Promise<void>
  walletClient: WalletClient | undefined
}

const WalletContext = createContext<WalletState | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<Eip1193Provider | undefined>(undefined)
  const [activeWalletId, setActiveWalletId] = useState<string | undefined>(undefined)
  const [address, setAddress] = useState<`0x${string}` | undefined>(undefined)
  const [chainId, setChainId] = useState<number | undefined>(undefined)
  const [isConnecting, setIsConnecting] = useState(false)

  const walletClient = useMemo(() => {
    if (!provider || !address || !chainId) return undefined
    const chain = supportedChains.find((c) => c.id === chainId)
    return createWalletClient({
      account: address,
      chain,
      transport: custom(provider),
    })
  }, [provider, address, chainId])

  const connect = useCallback(async (option: WalletOption) => {
    if (!option.provider) {
      if (option.installUrl) window.open(option.installUrl, '_blank', 'noopener,noreferrer')
      return
    }
    setIsConnecting(true)
    try {
      const accounts = (await option.provider.request({
        method: 'eth_requestAccounts',
      })) as string[]
      const currentChainId = (await option.provider.request({
        method: 'eth_chainId',
      })) as string
      setProvider(option.provider)
      setActiveWalletId(option.id)
      setAddress(accounts[0] as `0x${string}` | undefined)
      setChainId(parseInt(currentChainId, 16))
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    // Clearing local state always "disconnects" the app's own UI, but
    // injected EIP-1193 providers have no universal way to force that —
    // most wallets keep this site in their own connected-sites list unless
    // we also ask them to revoke it via EIP-2255 (not all wallets implement it).
    let revoked = false
    if (provider) {
      try {
        await provider.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        })
        revoked = true
      } catch {
        // Wallet doesn't support wallet_revokePermissions — fall through.
      }
    }
    setAddress(undefined)
    setProvider(undefined)
    setActiveWalletId(undefined)
    return revoked
  }, [provider])

  const switchChain = useCallback(
    async (targetChainId: number) => {
      if (!provider) return
      const hexChainId = `0x${targetChainId.toString(16)}`
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexChainId }],
        })
      } catch (error) {
        const chain = supportedChains.find((c) => c.id === targetChainId)
        const code = (error as { code?: number })?.code
        if (code === 4902 && chain) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hexChainId,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: chain.rpcUrls.default.http,
              },
            ],
          })
        } else {
          throw error
        }
      }
    },
    [provider],
  )

  useEffect(() => {
    if (!provider) return

    const onAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[]
      setAddress(accounts[0] as `0x${string}` | undefined)
    }
    const onChainChanged = (...args: unknown[]) => {
      const newChainId = args[0] as string
      setChainId(parseInt(newChainId, 16))
    }

    provider.on('accountsChanged', onAccountsChanged)
    provider.on('chainChanged', onChainChanged)
    return () => {
      provider.removeListener('accountsChanged', onAccountsChanged)
      provider.removeListener('chainChanged', onChainChanged)
    }
  }, [provider])

  const value: WalletState = {
    address,
    chainId,
    activeWalletId,
    isConnecting,
    connect,
    disconnect,
    switchChain,
    walletClient,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider')
  return ctx
}
