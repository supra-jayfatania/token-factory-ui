import { rateLimitedMintERC20FactoryAbi } from '../../config/abis/rateLimitedMintERC20Factory.abi'
import { writeAndWait, type TxClients } from './write'

type FactoryTx = TxClients & { factoryAddress: `0x${string}` }

/** All amounts in the token's smallest unit; mintPeriod in seconds; maxSupply 0 = uncapped. */
export type CreateTokenParams = {
  name: string
  symbol: string
  decimals: number
  maxSupply: bigint
  mintPeriod: bigint
  mintCapPerPeriod: bigint
  mintCapPerRequest: bigint
}

export const createToken = ({ factoryAddress, ...clients }: FactoryTx, p: CreateTokenParams) =>
  writeAndWait(clients, factoryAddress, rateLimitedMintERC20FactoryAbi, 'createToken', [
    p.name,
    p.symbol,
    p.decimals,
    p.maxSupply,
    p.mintPeriod,
    p.mintCapPerPeriod,
    p.mintCapPerRequest,
  ])
