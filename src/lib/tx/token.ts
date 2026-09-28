import { rateLimitedMintERC20Abi } from '../../config/abis/rateLimitedMintERC20.abi'
import { writeAndWait, type TxClients } from './write'

type TokenTx = TxClients & { tokenAddress: `0x${string}` }

const write = ({ tokenAddress, ...clients }: TokenTx, functionName: string, args: readonly unknown[]) =>
  writeAndWait(clients, tokenAddress, rateLimitedMintERC20Abi, functionName, args)

/** amount is already in the token's smallest unit — scale with `parseAmount` before calling. */
export const mint = (tx: TokenTx, to: `0x${string}`, amount: bigint) => write(tx, 'mint', [to, amount])

export const transfer = (tx: TokenTx, to: `0x${string}`, value: bigint) => write(tx, 'transfer', [to, value])

export const approve = (tx: TokenTx, spender: `0x${string}`, value: bigint) =>
  write(tx, 'approve', [spender, value])

/** Owner only. All three are replaced together; capPerRequest must be ≤ capPerPeriod. */
export const setMintLimits = (tx: TokenTx, period: bigint, capPerPeriod: bigint, capPerRequest: bigint) =>
  write(tx, 'setMintLimits', [period, capPerPeriod, capPerRequest])

export const transferOwnership = (tx: TokenTx, newOwner: `0x${string}`) =>
  write(tx, 'transferOwnership', [newOwner])

/** Irreversible — nobody is exempt from the rate limits afterwards. */
export const renounceOwnership = (tx: TokenTx) => write(tx, 'renounceOwnership', [])
