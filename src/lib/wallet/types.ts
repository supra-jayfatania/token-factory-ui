export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  on(event: string, listener: (...args: unknown[]) => void): void
  removeListener(event: string, listener: (...args: unknown[]) => void): void
}

/**
 * StarKey (Supra's wallet) exposes its EVM-compatible provider under
 * `window.starkey.evm` rather than the shared `window.ethereum` slot —
 * unconfirmed whether it also announces via EIP-6963, so this is used as
 * an explicit fallback if it doesn't.
 */
export interface StarkeyProvider {
  evm?: Eip1193Provider
}

declare global {
  interface Window {
    starkey?: StarkeyProvider
  }
}
