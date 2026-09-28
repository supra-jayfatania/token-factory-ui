import { defineChain, type Chain } from 'viem'

/**
 * Supra EVM QA is not a public/well-known chain and the contract reference
 * doc doesn't state its chain id, so it must come from an env var. There is
 * no safe default to fall back to (guessing wrong would silently point
 * transactions at the wrong network) — when it's missing the app renders a
 * "network not configured" screen instead.
 */
const supraQaChainId = import.meta.env.VITE_SUPRA_EVM_QA_CHAIN_ID
const supraQaExplorerUrl = import.meta.env.VITE_SUPRA_EVM_QA_EXPLORER_URL

// The browser only ever reaches the node through the app's own /api/rpc, which
// forwards to VITE_SUPRA_EVM_QA_RPC_URL (vite.config.ts under `pnpm dev`/`preview`,
// api/rpc.ts on Vercel) — the nodes available are plain http:// or send no CORS
// headers. Absolute, because wallet_addEthereumChain requires a full URL.
const supraQaRpcUrl = new URL('/api/rpc', window.location.origin).href

// A malformed id (e.g. "supra-qa") would become NaN and leave every write
// stuck on "switch network", so treat it the same as a missing one.
const parsedChainId = supraQaChainId ? Number(supraQaChainId) : NaN
const validChainId = Number.isSafeInteger(parsedChainId) && parsedChainId > 0 ? parsedChainId : undefined

export const supraEvmQa: Chain | undefined =
  validChainId !== undefined
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
