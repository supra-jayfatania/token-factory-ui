import { formatCountdown } from '../lib/units'

export function BudgetCountdown({ resetsAt }: { resetsAt: Date }) {
  const resetsAtSeconds = BigInt(Math.floor(resetsAt.getTime() / 1000))
  return <span>{formatCountdown(resetsAtSeconds)}</span>
}
