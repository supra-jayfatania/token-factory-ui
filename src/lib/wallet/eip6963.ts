import type { Eip1193Provider } from './types'

export interface Eip6963ProviderInfo {
  uuid: string
  name: string
  icon: string
  rdns: string
}

export interface Eip6963ProviderDetail {
  info: Eip6963ProviderInfo
  provider: Eip1193Provider
}

/**
 * EIP-6963 (Multi Injected Provider Discovery) — the standard modern wallets
 * (MetaMask, Rabby, Coinbase Wallet, …) use to announce themselves without
 * fighting over the single `window.ethereum` slot. Listens for announcements
 * and re-requests them; returns an unsubscribe function.
 */
export function subscribeToEip6963Providers(
  onAnnounce: (detail: Eip6963ProviderDetail) => void,
): () => void {
  const handler = (event: Event) => {
    onAnnounce((event as CustomEvent<Eip6963ProviderDetail>).detail)
  }
  window.addEventListener('eip6963:announceProvider', handler)
  window.dispatchEvent(new Event('eip6963:requestProvider'))
  return () => window.removeEventListener('eip6963:announceProvider', handler)
}
