import type { PublicClient, WalletClient } from 'viem'
import { tokenFactoryAbi } from '../../config/abis/tokenFactory.abi'

type FactoryTx = {
  walletClient: WalletClient
  publicClient: PublicClient
  factoryAddress: `0x${string}`
}

async function write(
  { walletClient, publicClient, factoryAddress }: FactoryTx,
  functionName: Parameters<typeof walletClient.writeContract>[0]['functionName'],
  args: readonly unknown[],
) {
  const account = walletClient.account
  if (!account) throw new Error('Wallet is not connected')
  const chain = walletClient.chain
  if (!chain) throw new Error('Wallet has no chain configured')

  const hash = await walletClient.writeContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName,
    args,
    account,
    chain,
  } as Parameters<typeof walletClient.writeContract>[0])
  return publicClient.waitForTransactionReceipt({ hash })
}

export const addMasterOwner = (tx: FactoryTx, account: `0x${string}`) =>
  write(tx, 'addMasterOwner', [account])

export const removeMasterOwner = (tx: FactoryTx, account: `0x${string}`) =>
  write(tx, 'removeMasterOwner', [account])

export const addSubOwner = (tx: FactoryTx, account: `0x${string}`) =>
  write(tx, 'addSubOwner', [account])

export const removeSubOwner = (tx: FactoryTx, account: `0x${string}`) =>
  write(tx, 'removeSubOwner', [account])

export const setMintingPaused = (tx: FactoryTx, paused: boolean) =>
  write(tx, 'setMintingPaused', [paused])

export const setTokenPaused = (tx: FactoryTx, token: `0x${string}`, paused: boolean) =>
  write(tx, 'setTokenPaused', [token, paused])

export const setFaucetConfig = (
  tx: FactoryTx,
  amountPerCall: bigint,
  limitPerPeriod: bigint,
  period: bigint,
) => write(tx, 'setFaucetConfig', [amountPerCall, limitPerPeriod, period])

export const createStableToken = (tx: FactoryTx, name: string, symbol: string) =>
  write(tx, 'createStableToken', [name, symbol])

export const createRegularToken = (tx: FactoryTx, name: string, symbol: string) =>
  write(tx, 'createRegularToken', [name, symbol])

export const createToken = (tx: FactoryTx, name: string, symbol: string, decimals: 6 | 18) =>
  write(tx, 'createToken', [name, symbol, decimals])
