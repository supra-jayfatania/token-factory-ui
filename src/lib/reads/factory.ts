import type { PublicClient } from 'viem'
import { tokenFactoryAbi } from '../../config/abis/tokenFactory.abi'

type FactoryRead = { client: PublicClient; factoryAddress: `0x${string}` }

export function readIsMasterOwner({ client, factoryAddress }: FactoryRead, account: `0x${string}`) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'isMasterOwner',
    args: [account],
  })
}

export function readIsSubOwner({ client, factoryAddress }: FactoryRead, account: `0x${string}`) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'isSubOwner',
    args: [account],
  })
}

export function readMasterOwnerCount({ client, factoryAddress }: FactoryRead) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'masterOwnerCount',
  })
}

export function readFaucetAmountPerCall({ client, factoryAddress }: FactoryRead) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'faucetAmountPerCall',
  })
}

export function readFaucetLimitPerPeriod({ client, factoryAddress }: FactoryRead) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'faucetLimitPerPeriod',
  })
}

export function readFaucetPeriod({ client, factoryAddress }: FactoryRead) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'faucetPeriod',
  })
}

export function readMintingPaused({ client, factoryAddress }: FactoryRead) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'mintingPaused',
  })
}

export function readTokenPaused({ client, factoryAddress }: FactoryRead, token: `0x${string}`) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'tokenPaused',
    args: [token],
  })
}

export function readMintingAllowedForToken(
  { client, factoryAddress }: FactoryRead,
  token: `0x${string}`,
) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'mintingAllowed',
    args: [token],
  })
}

export function readAllTokens({ client, factoryAddress }: FactoryRead) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'allTokens',
  })
}

export function readTokensOfCreator(
  { client, factoryAddress }: FactoryRead,
  creator: `0x${string}`,
) {
  return client.readContract({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    functionName: 'tokensOfCreator',
    args: [creator],
  })
}

export function watchTokenCreated(
  { client, factoryAddress }: FactoryRead,
  onNewToken: (token: `0x${string}`) => void,
) {
  return client.watchContractEvent({
    address: factoryAddress,
    abi: tokenFactoryAbi,
    eventName: 'TokenCreated',
    onLogs: (logs) => {
      for (const log of logs) {
        const token = log.args.token
        if (token) onNewToken(token)
      }
    },
  })
}
