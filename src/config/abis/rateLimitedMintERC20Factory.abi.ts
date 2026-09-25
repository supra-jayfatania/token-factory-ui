import { parseAbi } from 'viem'

/**
 * Written from the "RateLimitedMintERC20Factory" section of the contract
 * reference doc — not generated from a compiled ABI JSON. The doc lists no
 * events, so none are declared here (new tokens are picked up by polling
 * `allTokensLength()` instead of watching a creation event).
 */
export const rateLimitedMintERC20FactoryAbi = parseAbi([
  'function createToken(string name_, string symbol_, uint8 decimals_, uint256 maxSupply_, uint256 mintPeriod_, uint256 mintCapPerPeriod_, uint256 mintCapPerRequest_) returns (address token)',
  'function getTokensByOwner(address owner) view returns (address[])',
  'function getTokenCount(address owner) view returns (uint256)',
  'function allTokens(uint256 index) view returns (address)',
  'function allTokensLength() view returns (uint256)',
])
