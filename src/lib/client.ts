import { createPublicClient, http, type Chain, type PublicClient } from 'viem'

const publicClients = new Map<number, PublicClient>()

export function getPublicClient(chain: Chain): PublicClient {
  const cached = publicClients.get(chain.id)
  if (cached) return cached

  const client = createPublicClient({ chain, transport: http() })
  publicClients.set(chain.id, client)
  return client
}
