import { defineChain, type Chain } from 'viem'
import { sepolia } from 'viem/chains'

/**
 * Supra EVM QA is not a public/well-known chain — the integration guide names
 * it but never states a chain id or RPC URL. Both must come from env vars;
 * there is no safe default to fall back to (guessing wrong would silently
 * point transactions at the wrong network).
 */
const supraQaChainId = import.meta.env.VITE_SUPRA_EVM_QA_CHAIN_ID
const supraQaRpcUrl = import.meta.env.VITE_SUPRA_EVM_QA_RPC_URL
const supraQaExplorerUrl = import.meta.env.VITE_SUPRA_EVM_QA_EXPLORER_URL

export const supraEvmQa: Chain | undefined =
  supraQaChainId && supraQaRpcUrl
    ? defineChain({
        id: Number(supraQaChainId),
        name: 'Supra EVM QA',
        nativeCurrency: { name: 'Supra', symbol: 'SUPRA', decimals: 18 },
        rpcUrls: { default: { http: [supraQaRpcUrl] } },
        blockExplorers: supraQaExplorerUrl
          ? { default: { name: 'Explorer', url: supraQaExplorerUrl } }
          : undefined,
        testnet: true,
      })
    : undefined

export const supportedChains: Chain[] = [
  sepolia,
  ...(supraEvmQa ? [supraEvmQa] : []),
]

export const isSupraQaConfigured = Boolean(supraEvmQa)
