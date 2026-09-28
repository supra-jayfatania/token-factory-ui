import { getAddress, isAddress } from 'viem'
import { supraEvmQa } from './chains'

export type ChainContracts = {
  tokenFactory: `0x${string}`
}

/**
 * RateLimitedMintERC20Factory address, from env like the chain id and RPC URL
 * since a redeploy changes it. A missing or malformed value (including a bad
 * mixed-case checksum, i.e. a typo) is treated as unconfigured, so the app
 * shows the setup screen instead of sending transactions to the wrong address.
 */
const supraQaFactoryEnv = import.meta.env.VITE_SUPRA_EVM_QA_FACTORY
const supraQaFactory =
  supraQaFactoryEnv && isAddress(supraQaFactoryEnv) ? getAddress(supraQaFactoryEnv) : undefined

export const isSupraQaFactoryConfigured = Boolean(supraQaFactory)

export const contractsByChain: Record<number, ChainContracts> =
  supraEvmQa && supraQaFactory ? { [supraEvmQa.id]: { tokenFactory: supraQaFactory } } : {}

export function getContracts(chainId: number): ChainContracts | undefined {
  return contractsByChain[chainId]
}
