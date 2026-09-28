/**
 * Vercel function: same-origin proxy for the Supra EVM QA RPC node, which only
 * speaks plain http:// — browsers block that from the https:// site (mixed
 * content), and going through the app's own origin also sidesteps CORS.
 *
 * The node's URL comes from SUPRA_EVM_QA_RPC_UPSTREAM, a server-only env var
 * (no VITE_ prefix), so it lives in the Vercel settings rather than the repo
 * and never reaches the client bundle. The app points at this with
 * VITE_SUPRA_EVM_QA_RPC_URL=/api/rpc.
 */
export async function POST(request: Request): Promise<Response> {
  const upstream = process.env.SUPRA_EVM_QA_RPC_UPSTREAM
  if (!upstream) {
    return new Response('SUPRA_EVM_QA_RPC_UPSTREAM is not set.', { status: 500 })
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
