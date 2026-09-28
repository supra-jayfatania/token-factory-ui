import { defineChain, type Chain } from 'viem'

/**
 * Supra EVM QA is not a public/well-known chain and the contract reference
 * doc doesn't state its chain id or RPC URL, so both must come from env
 * vars. There is no safe default to fall back to (guessing wrong would
 * silently point transactions at the wrong network) — when they're missing
 * the app renders a "network not configured" screen instead.
 */
const supraQaChainId = import.meta.env.VITE_SUPRA_EVM_QA_CHAIN_ID
const supraQaExplorerUrl = import.meta.env.VITE_SUPRA_EVM_QA_EXPLORER_URL

// A path like "/rpc" (the same-origin proxy in vercel.json) is resolved against
// the current site, so one setting works on every deployment URL and the
// wallet still gets the absolute URL that wallet_addEthereumChain requires.
const supraQaRpcUrl = import.meta.env.VITE_SUPRA_EVM_QA_RPC_URL
  ? new URL(import.meta.env.VITE_SUPRA_EVM_QA_RPC_URL, window.location.origin).href
  : undefined

// A malformed id (e.g. "supra-qa") would become NaN and leave every write
// stuck on "switch network", so treat it the same as a missing one.
const parsedChainId = supraQaChainId ? Number(supraQaChainId) : NaN
const validChainId = Number.isSafeInteger(parsedChainId) && parsedChainId > 0 ? parsedChainId : undefined

export const supraEvmQa: Chain | undefined =
  validChainId !== undefined && supraQaRpcUrl
    ? defineChain({
        id: validChainId,
        name: 'Supra EVM QA',
        nativeCurrency: { name: 'Supra', symbol: 'SUPRA', decimals: 18 },
        rpcUrls: { default: { http: [supraQaRpcUrl] } },
        blockExplorers: supraQaExplorerUrl
          ? { default: { name: 'Explorer', url: supraQaExplorerUrl } }
          : undefined,
        testnet: true,
      })
    : undefined

export const supportedChains: Chain[] = supraEvmQa ? [supraEvmQa] : []

export const isSupraQaConfigured = Boolean(supraEvmQa)
