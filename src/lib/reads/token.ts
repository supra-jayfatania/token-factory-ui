import type { PublicClient } from 'viem'
import { customErc20Abi } from '../../config/abis/customErc20.abi'
import { parseMintBudget } from '../units'

type TokenRead = { client: PublicClient; tokenAddress: `0x${string}` }

export function readDecimals({ client, tokenAddress }: TokenRead) {
  return client.readContract({
    address: tokenAddress,
    abi: customErc20Abi,
    functionName: 'decimals',
  })
}

export function readSymbol({ client, tokenAddress }: TokenRead) {
  return client.readContract({
    address: tokenAddress,
    abi: customErc20Abi,
    functionName: 'symbol',
  })
}

export function readName({ client, tokenAddress }: TokenRead) {
  return client.readContract({
    address: tokenAddress,
    abi: customErc20Abi,
    functionName: 'name',
  })
}

export function readBalance({ client, tokenAddress }: TokenRead, account: `0x${string}`) {
  return client.readContract({
    address: tokenAddress,
    abi: customErc20Abi,
    functionName: 'balanceOf',
    args: [account],
  })
}

export function readAllowance(
  { client, tokenAddress }: TokenRead,
  owner: `0x${string}`,
  spender: `0x${string}`,
) {
  return client.readContract({
    address: tokenAddress,
    abi: customErc20Abi,
    functionName: 'allowance',
    args: [owner, spender],
  })
}

export async function readMintBudget({ client, tokenAddress }: TokenRead, account: `0x${string}`) {
  const [remaining, resetsAt] = await client.readContract({
    address: tokenAddress,
    abi: customErc20Abi,
    functionName: 'mintBudgetOf',
    args: [account],
  })
  return parseMintBudget(remaining, resetsAt)
}

export function readMintingAllowed({ client, tokenAddress }: TokenRead) {
  return client.readContract({
    address: tokenAddress,
    abi: customErc20Abi,
    functionName: 'mintingAllowed',
  })
}

export function readCreator({ client, tokenAddress }: TokenRead) {
  return client.readContract({
    address: tokenAddress,
    abi: customErc20Abi,
    functionName: 'creator',
  })
}
