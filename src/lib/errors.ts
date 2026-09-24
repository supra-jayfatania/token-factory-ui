import { BaseError, ContractFunctionRevertedError } from 'viem'

/** OZ v5 custom errors — decoded by name via the ABI (viem does this automatically when the error is in the ABI passed to the contract call). */
const CUSTOM_ERROR_COPY: Record<string, string> = {
  ERC20InsufficientBalance: "You don't have enough balance for this.",
  ERC20InsufficientAllowance: "This spender isn't approved for that amount.",
  ERC20InvalidReceiver: 'Enter a valid recipient address.',
  ERC20InvalidSpender: 'Enter a valid address to approve.',
  // ERC20InvalidSender / ERC20InvalidApprover aren't reachable through
  // normal wallet use per the guide — fall through to the generic message.
}

/** Plain `require`/`revert` strings, from both tables in the integration guide. */
const REVERT_STRING_COPY: Record<string, string> = {
  'Token: minting paused': 'Minting is currently paused for this token.',
  'Token: mint cap reached':
    "You've hit your limit for this period — try again after the cooldown.",
  'Token: length mismatch': "Recipient and amount lists don't match.",

  'Factory: only master owner': 'Only a master owner can perform this action.',
  'Factory: not authorised': "You're not authorized to create a token.",
  'Factory: zero address': 'Enter a valid address.',
  'Factory: already a master owner': 'This address is already a master owner.',
  'Factory: already a sub owner': 'This address is already a sub owner.',
  'Factory: not a master owner': "This address isn't a master owner.",
  'Factory: not a sub owner': "This address isn't a sub owner.",
  'Factory: last master owner': "You can't remove the last master owner.",
  'Factory: unknown token': "This address wasn't deployed by this factory.",
  'Factory: amount is zero': 'Enter an amount greater than zero.',
  'Factory: amount above limit': "That amount is above the factory's allowed limit.",
  'Factory: period is zero': 'Enter a period greater than zero.',
  'Factory: decimals must be 6 or 18': 'Decimals must be either 6 or 18.',
}

export function describeContractError(error: unknown): string {
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (e) => e instanceof ContractFunctionRevertedError,
    ) as ContractFunctionRevertedError | undefined

    if (revertError?.data?.errorName) {
      const copy = CUSTOM_ERROR_COPY[revertError.data.errorName]
      if (copy) return copy
    }

    // Plain string reverts surface as the revert reason inside shortMessage/reason.
    const haystack = `${error.shortMessage ?? ''} ${error.message ?? ''}`
    for (const [needle, copy] of Object.entries(REVERT_STRING_COPY)) {
      if (haystack.includes(needle)) return copy
    }

    return error.shortMessage || 'Transaction failed.'
  }

  if (error instanceof Error) return error.message
  return 'Transaction failed.'
}
