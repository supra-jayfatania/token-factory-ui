import { erc20Abi, parseAbi } from 'viem'

/**
 * Written from the "RateLimitedMintERC20" section of the contract reference
 * doc. The standard ERC20 surface comes from viem's built-in `erc20Abi`;
 * below is the token's own rate-limit/supply surface plus OpenZeppelin
 * Ownable. The doc names no custom errors of its own, so only the standard
 * OpenZeppelin v5 errors are declared (for automatic revert decoding).
 */
const rateLimitedMintExtensions = parseAbi([
  // Rate-limited minting
  'function mint(address to, uint256 amount)',
  'function setMintLimits(uint256 newMintPeriod, uint256 newMintCapPerPeriod, uint256 newMintCapPerRequest)',
  'function mintWindowOf(address account) view returns (uint256 windowStart, uint256 mintedInWindow, uint256 remainingInWindow, uint256 secondsUntilReset)',

  // Supply cap + rate-limit settings
  'function hasMaxSupply() view returns (bool)',
  'function maxSupply() view returns (uint256)',
  'function mintPeriod() view returns (uint256)',
  'function mintCapPerPeriod() view returns (uint256)',
  'function mintCapPerRequest() view returns (uint256)',

  // Ownable
  'function owner() view returns (address)',
  'function transferOwnership(address newOwner)',
  'function renounceOwnership()',

  // OpenZeppelin v5 custom errors
  'error OwnableUnauthorizedAccount(address account)',
  'error OwnableInvalidOwner(address owner)',
  'error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)',
  'error ERC20InvalidSender(address sender)',
  'error ERC20InvalidReceiver(address receiver)',
  'error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)',
  'error ERC20InvalidApprover(address approver)',
  'error ERC20InvalidSpender(address spender)',
])

export const rateLimitedMintERC20Abi = [...erc20Abi, ...rateLimitedMintExtensions]
