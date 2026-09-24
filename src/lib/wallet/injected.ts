import type { Eip1193Provider } from './types'

export function getInjectedProvider(): Eip1193Provider | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum
}
