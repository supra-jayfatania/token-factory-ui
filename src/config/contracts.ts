import { sepolia } from 'viem/chains'
import { supraEvmQa } from './chains'

export type SeedToken = {
  address: `0x${string}`
  symbol: string
  decimals: 6 | 18
}

export type ChainContracts = {
  tokenFactory: `0x${string}`
  /** Tokens known at deploy time, shown before `allTokens()`/`TokenCreated` finish loading. */
  seedTokens: SeedToken[]
}

/**
 * ⚠ The integration guide is internally inconsistent about the Sepolia
 * TokenFactory address:
 *   - its "current deployment" table says 0x0dD8fF327dFa222470837f55cbaB50FC63c323EA
 *   - a JSON config block and the ethers code sample later in the SAME doc
 *     both use                0x4cf75cBC373e7B9591a2b0843AeA6C221Ea87Be6
 * Defaulting to the table's value (the doc's canonical "current deployment"
 * section) but surfacing the conflict via VITE_SEPOLIA_FACTORY_ADDRESS so it
 * can be overridden without a code change once confirmed with the doc owner.
 */
const SEPOLIA_FACTORY_FROM_TABLE = '0x0dD8fF327dFa222470837f55cbaB50FC63c323EA'
const SEPOLIA_FACTORY_FROM_SAMPLES = '0x4cf75cBC373e7B9591a2b0843AeA6C221Ea87Be6'
export const sepoliaFactoryAddressConflict = {
  table: SEPOLIA_FACTORY_FROM_TABLE,
  codeSample: SEPOLIA_FACTORY_FROM_SAMPLES,
} as const

const sepoliaFactory = (import.meta.env.VITE_SEPOLIA_FACTORY_ADDRESS ??
  SEPOLIA_FACTORY_FROM_TABLE) as `0x${string}`

export const contractsByChain: Record<number, ChainContracts> = {
  [sepolia.id]: {
    tokenFactory: sepoliaFactory,
    seedTokens: [
      {
        address: '0xafc7FBff3C9118c10DF9AEdF566a1ad7213Ff07a',
        symbol: 'tUSD',
        decimals: 6,
      },
      {
        address: '0x8816505e9233a915c8B15a21Ae9F139e7BD47632',
        symbol: 'tCOIN',
        decimals: 18,
      },
    ],
  },
  ...(supraEvmQa
    ? {
        [supraEvmQa.id]: {
          tokenFactory: '0xeAC87c4F60a60285E3eCdEB4aDb0175C1c0e9EFf',
          seedTokens: [
            {
              address: '0x38965c58587e0C21a7c6825bE48E4FB05b4156D2',
              symbol: 'tUSD',
              decimals: 6,
            },
            {
              address: '0x3De7ec741832F05882cbb145E692FC80443941FB',
              symbol: 'tCOIN',
              decimals: 18,
            },
          ],
        } satisfies ChainContracts,
      }
    : {}),
}

export function getContracts(chainId: number): ChainContracts | undefined {
  return contractsByChain[chainId]
}
