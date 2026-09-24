import { parseAbi } from 'viem'

/**
 * Reconstructed from the function/event signatures listed in the
 * frontend-integration-guide.docx (no ABI JSON file was reachable from
 * Drive). Mechanical translation of the doc's reference tables — verify
 * against the real TokenFactory.abi.json once available.
 */
export const tokenFactoryAbi = parseAbi([
  // Reads
  'function isMasterOwner(address account) view returns (bool)',
  'function isSubOwner(address account) view returns (bool)',
  'function masterOwnerCount() view returns (uint256)',
  'function deployer() view returns (address)',
  'function faucetAmountPerCall() view returns (uint256)',
  'function faucetLimitPerPeriod() view returns (uint256)',
  'function faucetPeriod() view returns (uint256)',
  'function mintingPaused() view returns (bool)',
  'function tokenPaused(address token) view returns (bool)',
  'function mintingAllowed(address token) view returns (bool)',
  'function tokens(uint256 index) view returns (address)',
  'function tokenCount() view returns (uint256)',
  'function allTokens() view returns (address[])',
  'function tokensOfCreator(address creator) view returns (address[])',
  'function isDeployedToken(address token) view returns (bool)',

  // Writes
  'function addMasterOwner(address account)',
  'function addMasterOwners(address[] accounts)',
  'function removeMasterOwner(address account)',
  'function addSubOwner(address account)',
  'function addSubOwners(address[] accounts)',
  'function removeSubOwner(address account)',
  'function setMintingPaused(bool paused)',
  'function setTokenPaused(address token, bool paused)',
  'function setFaucetConfig(uint256 amountPerCall, uint256 limitPerPeriod, uint256 period)',
  'function createToken(string name, string symbol, uint8 decimals) returns (address)',
  'function createStableToken(string name, string symbol) returns (address)',
  'function createRegularToken(string name, string symbol) returns (address)',

  // Events — the doc only marks `indexed` explicitly on TokenPausedSet and
  // TokenCreated; the rest are listed as plain `EventName(types)` with no
  // indexed/non-indexed markup, so their indexing below is unconfirmed.
  'event MasterOwnerAdded(address account)',
  'event MasterOwnerRemoved(address account)',
  'event SubOwnerAdded(address account)',
  'event SubOwnerRemoved(address account)',
  'event FaucetConfigUpdated(uint256 amountPerCall, uint256 limitPerPeriod, uint256 period)',
  'event MintingPausedSet(bool paused)',
  'event TokenPausedSet(address indexed token, bool paused)',
  'event TokenCreated(address indexed token, address indexed creator, string name, string symbol, uint8 decimals)',
])
