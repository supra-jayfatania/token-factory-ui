import { erc20Abi, parseAbi } from 'viem'

/**
 * Reconstructed from the integration guide. Standard ERC20 surface comes
 * from viem's built-in `erc20Abi`; everything below is ERC20Burnable +
 * CustomERC20's own reads/writes/events, plus the OZ v5 custom errors the
 * guide calls out so viem can auto-decode reverts.
 */
const customErc20Extensions = parseAbi([
  // ERC20Burnable
  'function burn(uint256 value)',
  'function burnFrom(address account, uint256 value)',

  // Custom reads
  'function factory() view returns (address)',
  'function creator() view returns (address)',
  'function mintBudgetOf(address account) view returns (uint256 remaining, uint256 resetsAt)',
  'function mintWindowOf(address account) view returns (uint64 windowStart, uint192 mintedInWindow)',
  'function mintingAllowed() view returns (bool)',

  // Custom writes
  'function mint(address to, uint256 value)',
  'function mintBatch(address[] to, uint256[] values)',
  'function getFaucet()',

  // Custom events
  'event Mint(address indexed by, address indexed to, uint256 value)',
  'event FaucetClaim(address indexed user, uint256 value)',

  // OpenZeppelin v5 ERC20 custom errors, for automatic revert decoding
  'error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed)',
  'error ERC20InvalidSender(address sender)',
  'error ERC20InvalidReceiver(address receiver)',
  'error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed)',
  'error ERC20InvalidApprover(address approver)',
  'error ERC20InvalidSpender(address spender)',
])

export const customErc20Abi = [...erc20Abi, ...customErc20Extensions]
