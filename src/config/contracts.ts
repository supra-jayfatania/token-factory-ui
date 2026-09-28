import { supraEvmQa } from './chains'

export type ChainContracts = {
  tokenFactory: `0x${string}`
}

/** RateLimitedMintERC20Factory, per the contract reference doc's "Deployed Contract" section. */
const SUPRA_EVM_QA_FACTORY = '0x2fc3aDFf0F18E2feF3EC9902E0908b09b1a4d332'

export const contractsByChain: Record<number, ChainContracts> = supraEvmQa
  ? { [supraEvmQa.id]: { tokenFactory: SUPRA_EVM_QA_FACTORY } }
  : {}

export function getContracts(chainId: number): ChainContracts | undefined {
  return contractsByChain[chainId]
}
