import type { PublicClient, WalletClient } from 'viem'
import { customErc20Abi } from '../../config/abis/customErc20.abi'

type TokenTx = {
  walletClient: WalletClient
  publicClient: PublicClient
  tokenAddress: `0x${string}`
}

async function write(
  { walletClient, publicClient, tokenAddress }: TokenTx,
  functionName: Parameters<typeof walletClient.writeContract>[0]['functionName'],
  args: readonly unknown[],
) {
  const account = walletClient.account
  if (!account) throw new Error('Wallet is not connected')
  const chain = walletClient.chain
  if (!chain) throw new Error('Wallet has no chain configured')

  const hash = await walletClient.writeContract({
    address: tokenAddress,
    abi: customErc20Abi,
    functionName,
    args,
    account,
    chain,
  } as Parameters<typeof walletClient.writeContract>[0])
  return publicClient.waitForTransactionReceipt({ hash })
}

/** value is already in the token's smallest unit — scale with `parseTokenAmount` before calling. */
export const mint = (tx: TokenTx, to: `0x${string}`, value: bigint) => write(tx, 'mint', [to, value])

export const mintBatch = (tx: TokenTx, to: `0x${string}`[], values: bigint[]) =>
  write(tx, 'mintBatch', [to, values])

export const getFaucet = (tx: TokenTx) => write(tx, 'getFaucet', [])

export const transfer = (tx: TokenTx, to: `0x${string}`, value: bigint) =>
  write(tx, 'transfer', [to, value])

export const approve = (tx: TokenTx, spender: `0x${string}`, value: bigint) =>
  write(tx, 'approve', [spender, value])

export const burn = (tx: TokenTx, value: bigint) => write(tx, 'burn', [value])
