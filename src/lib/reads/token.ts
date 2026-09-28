import type { PublicClient } from 'viem'
import { rateLimitedMintERC20Abi } from '../../config/abis/rateLimitedMintERC20.abi'

type TokenRead = { client: PublicClient; tokenAddress: `0x${string}` }

export function readName({ client, tokenAddress }: TokenRead) {
  return client.readContract({ address: tokenAddress, abi: rateLimitedMintERC20Abi, functionName: 'name' })
}

export function readSymbol({ client, tokenAddress }: TokenRead) {
  return client.readContract({ address: tokenAddress, abi: rateLimitedMintERC20Abi, functionName: 'symbol' })
}

export function readDecimals({ client, tokenAddress }: TokenRead) {
  return client.readContract({ address: tokenAddress, abi: rateLimitedMintERC20Abi, functionName: 'decimals' })
}

export function readOwner({ client, tokenAddress }: TokenRead) {
  return client.readContract({ address: tokenAddress, abi: rateLimitedMintERC20Abi, functionName: 'owner' })
}

export function readTotalSupply({ client, tokenAddress }: TokenRead) {
  return client.readContract({ address: tokenAddress, abi: rateLimitedMintERC20Abi, functionName: 'totalSupply' })
}

/** 0 means the token is uncapped. */
export function readMaxSupply({ client, tokenAddress }: TokenRead) {
  return client.readContract({ address: tokenAddress, abi: rateLimitedMintERC20Abi, functionName: 'maxSupply' })
}

export function readBalance({ client, tokenAddress }: TokenRead, account: `0x${string}`) {
  return client.readContract({
    address: tokenAddress,
    abi: rateLimitedMintERC20Abi,
    functionName: 'balanceOf',
    args: [account],
  })
}

export type MintLimits = { period: bigint; capPerPeriod: bigint; capPerRequest: bigint }

export async function readMintLimits({ client, tokenAddress }: TokenRead): Promise<MintLimits> {
  const [period, capPerPeriod, capPerRequest] = await Promise.all([
    client.readContract({ address: tokenAddress, abi: rateLimitedMintERC20Abi, functionName: 'mintPeriod' }),
    client.readContract({ address: tokenAddress, abi: rateLimitedMintERC20Abi, functionName: 'mintCapPerPeriod' }),
    client.readContract({ address: tokenAddress, abi: rateLimitedMintERC20Abi, functionName: 'mintCapPerRequest' }),
  ])
  return { period, capPerPeriod, capPerRequest }
}

export type MintWindow = {
  /** Unix seconds; 0 when the account has never minted or its last window expired. */
  windowStart: bigint
  mintedInWindow: bigint
  /** Left under mintCapPerPeriod — does NOT account for the separate per-request cap. */
  remainingInWindow: bigint
  /** 0 when the window has already expired. */
  secondsUntilReset: bigint
}

export async function readMintWindow({ client, tokenAddress }: TokenRead, account: `0x${string}`): Promise<MintWindow> {
  const [windowStart, mintedInWindow, remainingInWindow, secondsUntilReset] = await client.readContract({
    address: tokenAddress,
    abi: rateLimitedMintERC20Abi,
    functionName: 'mintWindowOf',
    args: [account],
  })
  return { windowStart, mintedInWindow, remainingInWindow, secondsUntilReset }
}
