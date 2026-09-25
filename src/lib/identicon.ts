import { isAddress, zeroAddress } from 'viem'

/** Deterministic two-tone gradient for an address, used as a lightweight avatar. */
export function addressGradient(address: string): string {
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hueA = Math.abs(hash) % 360
  const hueB = (hueA + 55) % 360
  return `linear-gradient(135deg, hsl(${hueA} 80% 60%), hsl(${hueB} 80% 50%))`
}

export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, 2 + chars)}…${address.slice(-chars)}`
}

export const sameAddress = (a: string | undefined, b: string | undefined) =>
  Boolean(a && b && a.toLowerCase() === b.toLowerCase())

/** Validation message for an address typed into a form; undefined when it's empty or fine. */
export function addressInputError(value: string): string | undefined {
  if (!value) return undefined
  return !isAddress(value) || value === zeroAddress ? 'Enter a valid address.' : undefined
}
