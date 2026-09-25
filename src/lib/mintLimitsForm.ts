import type { MintLimits } from './reads/token'
import { formatUnits } from 'viem'
import { invalidAmountMessage, parseAmount, periodToSeconds, splitPeriod, type PeriodUnit } from './units'

/** Raw form input for the three rate-limit settings, shared by Create and Manage. */
export type MintLimitsInput = {
  periodValue: string
  periodUnit: PeriodUnit
  capPerPeriod: string
  capPerRequest: string
}

export type MintLimitsErrors = Partial<Record<'period' | 'capPerPeriod' | 'capPerRequest', string>>

export const EMPTY_MINT_LIMITS: MintLimitsInput = {
  periodValue: '2',
  periodUnit: 'hours',
  capPerPeriod: '',
  capPerRequest: '',
}

export function mintLimitsToInput(limits: MintLimits, decimals: number): MintLimitsInput {
  const { value, unit } = splitPeriod(limits.period)
  return {
    periodValue: value,
    periodUnit: unit,
    capPerPeriod: formatUnits(limits.capPerPeriod, decimals),
    capPerRequest: formatUnits(limits.capPerRequest, decimals),
  }
}

/** Caps are entered in whole tokens and scaled by `decimals`; the doc requires capPerRequest ≤ capPerPeriod. */
export function validateMintLimits(
  input: MintLimitsInput,
  decimals: number,
): { limits: MintLimits; errors: MintLimitsErrors } | { limits: undefined; errors: MintLimitsErrors } {
  const errors: MintLimitsErrors = {}
  const period = periodToSeconds(input.periodValue, input.periodUnit)
  const capPerPeriod = parseAmount(input.capPerPeriod, decimals)
  const capPerRequest = parseAmount(input.capPerRequest, decimals)

  if (period === undefined || period === 0n) errors.period = 'Enter a whole number greater than zero.'
  if (capPerPeriod === undefined) errors.capPerPeriod = invalidAmountMessage(input.capPerPeriod, decimals)
  if (capPerRequest === undefined) errors.capPerRequest = invalidAmountMessage(input.capPerRequest, decimals)
  if (capPerPeriod !== undefined && capPerRequest !== undefined && capPerRequest > capPerPeriod) {
    errors.capPerRequest = "Can't be more than the per-period cap."
  }

  if (Object.keys(errors).length > 0 || period === undefined || capPerPeriod === undefined || capPerRequest === undefined) {
    return { limits: undefined, errors }
  }
  return { limits: { period, capPerPeriod, capPerRequest }, errors }
}
