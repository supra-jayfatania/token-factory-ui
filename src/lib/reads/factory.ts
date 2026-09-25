import type { PublicClient } from 'viem'
import { rateLimitedMintERC20FactoryAbi } from '../../config/abis/rateLimitedMintERC20Factory.abi'

type FactoryRead = { client: PublicClient; factoryAddress: `0x${string}` }

export function readAllTokensLength({ client, factoryAddress }: FactoryRead) {
  return client.readContract({
    address: factoryAddress,
    abi: rateLimitedMintERC20FactoryAbi,
    functionName: 'allTokensLength',
  })
}

export function readTokenAt({ client, factoryAddress }: FactoryRead, index: bigint) {
  return client.readContract({
    address: factoryAddress,
    abi: rateLimitedMintERC20FactoryAbi,
    functionName: 'allTokens',
    args: [index],
  })
}

/**
 * "Owner" here means the address that called createToken — not the token's current owner().
 * Pass `blockNumber` to read as of a specific block (e.g. a receipt's), so a lagging RPC node can't
 * answer with the list from before that block.
 */
export function readTokensByCreator(
  { client, factoryAddress }: FactoryRead,
  creator: `0x${string}`,
  blockNumber?: bigint,
) {
  return client.readContract({
    address: factoryAddress,
    abi: rateLimitedMintERC20FactoryAbi,
    functionName: 'getTokensByOwner',
    args: [creator],
    blockNumber,
  })
}
