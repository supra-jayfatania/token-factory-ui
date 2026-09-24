import { formatUnits, maxUint256, parseUnits } from 'viem'

export const UNLIMITED_BUDGET_SENTINEL = maxUint256

export type MintBudget =
  | { unlimited: true }
  | { unlimited: false; remaining: bigint; resetsAt: bigint | null }

/**
 * mintBudgetOf(address) -> (remaining, resetsAt).
 * remaining === MaxUint256 means "master owner, unlimited" — never format
 * that as a token amount. resetsAt === 0 for a non-master address means
 * "no window currently open" (full budget available now), not epoch zero.
 */
export function parseMintBudget(remaining: bigint, resetsAt: bigint): MintBudget {
  if (remaining === UNLIMITED_BUDGET_SENTINEL) {
    return { unlimited: true }
  }
  return {
    unlimited: false,
    remaining,
    resetsAt: resetsAt === 0n ? null : resetsAt,
  }
}

export function formatTokenAmount(amount: bigint, decimals: number): string {
  return formatUnits(amount, decimals)
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
  return parseUnits(amount, decimals)
}

/** faucetAmountPerCall() is in whole tokens; scale to the token's smallest unit before comparing to mintBudgetOf's `remaining`. */
export function scaleWholeTokenAmount(wholeAmount: bigint, decimals: number): bigint {
  return wholeAmount * 10n ** BigInt(decimals)
}

export function formatCountdown(resetsAt: bigint, nowMs = Date.now()): string {
  const remainingSeconds = Number(resetsAt) - Math.floor(nowMs / 1000)
  if (remainingSeconds <= 0) return '0s'
  const h = Math.floor(remainingSeconds / 3600)
  const m = Math.floor((remainingSeconds % 3600) / 60)
  const s = remainingSeconds % 60
  return [h && `${h}h`, (h || m) && `${m}m`, `${s}s`].filter(Boolean).join(' ')
}
