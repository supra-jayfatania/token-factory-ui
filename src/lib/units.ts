import { formatUnits, maxUint256, parseUnits } from 'viem'

/**
 * Formats a smallest-unit amount for display with thousands separators,
 * trimmed to `maxFractionDigits`. Works on the decimal string, so large
 * 18-decimal values don't lose precision the way Number() would. A non-zero
 * amount too small to show is rendered as e.g. "<0.0001", never as "0".
 */
export function formatAmount(value: bigint, decimals: number, maxFractionDigits = 4): string {
  const [whole, fraction = ''] = formatUnits(value, decimals).split('.')
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const trimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, '')
  if (value > 0n && grouped === '0' && !trimmed) {
    return maxFractionDigits > 0 ? `<0.${'0'.repeat(maxFractionDigits - 1)}1` : '<1'
  }
  return trimmed ? `${grouped}.${trimmed}` : grouped
}

/**
 * Parses user input like "12.5" into the smallest unit; undefined when it isn't
 * a valid non-negative amount. Commas are rejected rather than stripped: in
 * locales that write "1,5" for 1.5, stripping them would silently parse 15.
 */
export function parseAmount(input: string, decimals: number): bigint | undefined {
  const trimmed = input.trim()
  if (!/^\d*\.?\d*$/.test(trimmed) || trimmed === '' || trimmed === '.') return undefined
  const fraction = trimmed.split('.')[1] ?? ''
  if (fraction.length > decimals) return undefined
  try {
    const value = parseUnits(trimmed, decimals)
    return value <= maxUint256 ? value : undefined
  } catch {
    return undefined
  }
}

/** Error copy for input that `parseAmount` rejected. */
export function invalidAmountMessage(input: string, decimals: number): string {
  return input.includes(',')
    ? 'Use a dot for decimals (e.g. 1.5) and no thousands separators.'
    : `Enter a valid amount (up to ${decimals} decimal places).`
}

export const PERIOD_UNITS = [
  { label: 'seconds', seconds: 1n },
  { label: 'minutes', seconds: 60n },
  { label: 'hours', seconds: 3600n },
  { label: 'days', seconds: 86_400n },
] as const

export type PeriodUnit = (typeof PERIOD_UNITS)[number]['label']

/** Picks the largest unit that divides the period evenly, for pre-filling edit forms. */
export function splitPeriod(seconds: bigint): { value: string; unit: PeriodUnit } {
  for (const unit of [...PERIOD_UNITS].reverse()) {
    if (seconds > 0n && seconds % unit.seconds === 0n) {
      return { value: (seconds / unit.seconds).toString(), unit: unit.label }
    }
  }
  return { value: seconds.toString(), unit: 'seconds' }
}

export function periodToSeconds(value: string, unit: PeriodUnit): bigint | undefined {
  if (!/^\d+$/.test(value.trim())) return undefined
  const multiplier = PERIOD_UNITS.find((u) => u.label === unit)!.seconds
  return BigInt(value.trim()) * multiplier
}

/** Human duration, e.g. 7200 → "2h", 5400 → "1h 30m", 45 → "45s". */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0s'
  const d = Math.floor(totalSeconds / 86_400)
  const h = Math.floor((totalSeconds % 86_400) / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(' ')
}

export const minBigInt = (...values: bigint[]) => values.reduce((a, b) => (b < a ? b : a))
