import { sameAddress } from './identicon'
import type { MintLimits, MintWindow } from './reads/token'
import { minBigInt } from './units'

export type MintStatus = {
  owner: `0x${string}`
  isOwner: boolean
  totalSupply: bigint
  /** 0 = uncapped. */
  maxSupply: bigint
  /** How much more can ever be minted before hitting maxSupply; undefined when uncapped. */
  supplyLeft: bigint | undefined
  limits: MintLimits
  /** Undefined without a connected wallet. */
  window: MintWindow | undefined
  /**
   * Largest amount the connected wallet can mint in its next call, across
   * every limit that applies to it; undefined = no limit at all (an owner of
   * an uncapped token).
   */
  maxMintNow: bigint | undefined
  /** ms timestamp when the wallet's window resets, or null when no window is open. */
  resetsAtMs: number | null
}

/** Pure derivation from raw reads — kept separate from the hook so it can be tested without React. */
export function deriveMintStatus({
  owner,
  account,
  totalSupply,
  maxSupply,
  limits,
  window,
  fetchedAt,
}: {
  owner: `0x${string}`
  account: `0x${string}` | undefined
  totalSupply: bigint
  maxSupply: bigint
  limits: MintLimits
  window: MintWindow | undefined
  fetchedAt: number
}): MintStatus {
  const isOwner = sameAddress(owner, account)
  const supplyLeft = maxSupply > 0n ? (maxSupply > totalSupply ? maxSupply - totalSupply : 0n) : undefined

  // Owners skip the rate limits entirely but can never pass maxSupply.
  // Everyone else is bound by the per-request cap and what's left in their window, too.
  const maxMintNow =
    !isOwner && window
      ? minBigInt(limits.capPerRequest, window.remainingInWindow, ...(supplyLeft !== undefined ? [supplyLeft] : []))
      : supplyLeft

  return {
    owner,
    isOwner,
    totalSupply,
    maxSupply,
    supplyLeft,
    limits,
    window,
    maxMintNow,
    resetsAtMs: window && window.secondsUntilReset > 0n ? fetchedAt + Number(window.secondsUntilReset) * 1000 : null,
  }
}
