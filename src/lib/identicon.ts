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
