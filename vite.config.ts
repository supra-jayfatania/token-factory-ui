import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The app calls /api/rpc on its own origin; this mirrors api/rpc.ts (the
  // Vercel function) for `pnpm dev` / `pnpm preview`, forwarding to the node in
  // VITE_SUPRA_EVM_QA_RPC_URL. Fail here rather than ship an app whose every call errors.
  const upstream = loadEnv(mode, process.cwd(), '').VITE_SUPRA_EVM_QA_RPC_URL
  if (!upstream) {
    throw new Error('Set VITE_SUPRA_EVM_QA_RPC_URL (the RPC node URL) in .env or the Vercel project settings.')
  }
  const upstreamUrl = new URL(upstream)
  const proxy: Record<string, ProxyOptions> = {
    '/api/rpc': {
      target: upstreamUrl.origin,
      changeOrigin: true,
      rewrite: () => upstreamUrl.pathname + upstreamUrl.search,
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      proxy,
    },
    preview: { proxy },
  }
})
