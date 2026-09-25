import type { Abi, PublicClient, WalletClient } from 'viem'

export type TxClients = { walletClient: WalletClient; publicClient: PublicClient }

/**
 * Sends a contract write and waits for its receipt. Refuses to send when the
 * wallet is on a different chain than the one the app reads from — otherwise
 * the transaction would hit the same address on the wrong network.
 */
export async function writeAndWait(
  { walletClient, publicClient }: TxClients,
  address: `0x${string}`,
  abi: Abi,
  functionName: string,
  args: readonly unknown[],
) {
  const account = walletClient.account
  if (!account) throw new Error('Wallet is not connected')
  const expectedChain = publicClient.chain
  if (!expectedChain || walletClient.chain?.id !== expectedChain.id) {
    throw new Error(`Switch your wallet to ${expectedChain?.name ?? 'the app network'} to continue.`)
  }

  const hash = await walletClient.writeContract({
    address,
    abi,
    functionName,
    args,
    account,
    chain: expectedChain,
  } as Parameters<typeof walletClient.writeContract>[0])
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') throw new Error('Transaction reverted.')
  return receipt
}
