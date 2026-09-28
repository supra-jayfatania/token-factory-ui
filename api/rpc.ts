/**
 * Vercel function: same-origin proxy for the Supra EVM QA RPC node, which only
 * speaks plain http:// — browsers block that from the https:// site (mixed
 * content), and going through the app's own origin also sidesteps CORS.
 *
 * The node's URL comes from VITE_SUPRA_EVM_QA_RPC_URL in the Vercel settings.
 * The app itself never reads that var — it always calls /api/rpc
 * (src/config/chains.ts); vite.config.ts serves the same path locally.
 */
export async function POST(request: Request): Promise<Response> {
  const upstream = process.env.VITE_SUPRA_EVM_QA_RPC_URL
  if (!upstream) {
    return new Response('VITE_SUPRA_EVM_QA_RPC_URL is not set.', { status: 500 })
  }

  try {
    const response = await fetch(upstream, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: await request.text(),
    })
    return new Response(await response.text(), {
      status: response.status,
      headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' },
    })
  } catch {
    return new Response('RPC node unreachable.', { status: 502 })
  }
}
