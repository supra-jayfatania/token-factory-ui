import { useEffect, useState } from 'react'
import { subscribeToEip6963Providers, type Eip6963ProviderDetail } from '../lib/wallet/eip6963'
import { getInjectedProvider } from '../lib/wallet/injected'
import type { Eip1193Provider } from '../lib/wallet/types'

export type WalletOption = {
  id: string
  name: string
  icon?: string
  provider?: Eip1193Provider
  /** Set when the wallet isn't detected, so the entry can still show with an "Install" link. */
  installUrl?: string
}

const STARKEY_INSTALL_URL = 'https://starkey.app/'
const isStarkey = (name: string) => /starkey/i.test(name)

/**
 * Wallet list for the connect dropdown: EIP-6963-announced wallets, plus a
 * StarKey entry (manually detected via `window.starkey.evm` if it hasn't
 * announced itself), plus a legacy `window.ethereum` fallback for wallets
 * that support neither. StarKey is always pinned first.
 */
export function useWalletOptions(): WalletOption[] {
  const [discovered, setDiscovered] = useState<Map<string, Eip6963ProviderDetail>>(new Map())

  useEffect(
    () =>
      subscribeToEip6963Providers((detail) => {
        setDiscovered((prev) => {
          if (prev.has(detail.info.rdns)) return prev
          return new Map(prev).set(detail.info.rdns, detail)
        })
      }),
    [],
  )

  const options: WalletOption[] = Array.from(discovered.values()).map((d) => ({
    id: d.info.rdns,
    name: d.info.name,
    icon: d.info.icon,
    provider: d.provider,
  }))

  if (!options.some((o) => isStarkey(o.name))) {
    const starkeyEvm = getStarkeyEvmProvider()
    options.push({
      id: 'starkey',
      name: 'StarKey',
      provider: starkeyEvm,
      installUrl: starkeyEvm ? undefined : STARKEY_INSTALL_URL,
    })
  }

  const legacyProvider = getInjectedProvider()
  if (legacyProvider && !options.some((o) => o.provider)) {
    options.push({ id: 'injected', name: 'Browser wallet', provider: legacyProvider })
  }

  return options.sort((a, b) => {
    const starkeyRank = Number(!isStarkey(a.name)) - Number(!isStarkey(b.name))
    if (starkeyRank !== 0) return starkeyRank
    const installedRank = Number(!a.provider) - Number(!b.provider)
    if (installedRank !== 0) return installedRank
    return a.name.localeCompare(b.name)
  })
}

function getStarkeyEvmProvider(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') return undefined
  return window.starkey?.evm
}
