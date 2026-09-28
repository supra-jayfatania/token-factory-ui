import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from 'viem'

/**
 * OpenZeppelin v5 custom errors — decoded by name via the ABI. The contract
 * reference doc doesn't name the token's own rate-limit / supply-cap revert
 * reasons, so those fall through to viem's short message; the Mint and Create
 * forms pre-check those limits client-side so users rarely hit them.
 */
const CUSTOM_ERROR_COPY: Record<string, string> = {
  OwnableUnauthorizedAccount: 'Only the token owner can do this.',
  OwnableInvalidOwner: 'Enter a valid new owner address.',
  ERC20InsufficientBalance: "You don't have enough balance for this.",
  ERC20InsufficientAllowance: "This spender isn't approved for that amount.",
  ERC20InvalidReceiver: 'Enter a valid recipient address.',
  ERC20InvalidSpender: 'Enter a valid address to approve.',
}

export function describeContractError(error: unknown): string {
  if (error instanceof BaseError) {
    if (error.walk((e) => e instanceof UserRejectedRequestError)) {
      return 'Transaction rejected in your wallet.'
    }

    const revertError = error.walk(
      (e) => e instanceof ContractFunctionRevertedError,
    ) as ContractFunctionRevertedError | undefined

    const errorName = revertError?.data?.errorName
    if (errorName && CUSTOM_ERROR_COPY[errorName]) return CUSTOM_ERROR_COPY[errorName]
    if (revertError?.reason) return revertError.reason

    return error.shortMessage || 'Transaction failed.'
  }

  if (error instanceof Error) return error.message
  return 'Transaction failed.'
}
