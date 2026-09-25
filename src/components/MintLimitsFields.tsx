import type { MintLimitsErrors, MintLimitsInput } from '../lib/mintLimitsForm'
import { PERIOD_UNITS, type PeriodUnit } from '../lib/units'
import { Input, Label } from './ui/Input'

/** Period + per-period cap + per-request cap. Errors only show once the field has a value, to avoid shouting on an empty form. */
export function MintLimitsFields({
  value,
  onChange,
  errors,
  symbol,
  disabled,
}: {
  value: MintLimitsInput
  onChange: (next: MintLimitsInput) => void
  errors: MintLimitsErrors
  symbol: string
  disabled?: boolean
}) {
  const set = (patch: Partial<MintLimitsInput>) => onChange({ ...value, ...patch })

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div>
        <Label>Mint period</Label>
        <div className="flex gap-2">
          <Input
            value={value.periodValue}
            onChange={(e) => set({ periodValue: e.target.value })}
            inputMode="numeric"
            placeholder="2"
            className="font-mono"
            disabled={disabled}
          />
          <select
            value={value.periodUnit}
            onChange={(e) => set({ periodUnit: e.target.value as PeriodUnit })}
            disabled={disabled}
            className="h-10 rounded-lg border border-border bg-surface-raised px-2 text-sm text-text focus:border-accent focus:outline-none disabled:opacity-40"
          >
            {PERIOD_UNITS.map((u) => (
              <option key={u.label} value={u.label}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <FieldHint error={value.periodValue ? errors.period : undefined} hint="Length of one rate-limit window." />
      </div>
      <div>
        <Label>Cap per period</Label>
        <Input
          value={value.capPerPeriod}
          onChange={(e) => set({ capPerPeriod: e.target.value })}
          inputMode="decimal"
          placeholder="1000"
          className="font-mono"
          disabled={disabled}
        />
        <FieldHint
          error={value.capPerPeriod ? errors.capPerPeriod : undefined}
          hint={`Max ${symbol || 'tokens'} a non-owner can mint per window.`}
        />
      </div>
      <div>
        <Label>Cap per request</Label>
        <Input
          value={value.capPerRequest}
          onChange={(e) => set({ capPerRequest: e.target.value })}
          inputMode="decimal"
          placeholder="100"
          className="font-mono"
          disabled={disabled}
        />
        <FieldHint
          error={value.capPerRequest ? errors.capPerRequest : undefined}
          hint="Max per single mint call."
        />
      </div>
    </div>
  )
}

export function FieldHint({ error, hint }: { error?: string; hint?: string }) {
  if (error) return <p className="mt-1.5 text-xs text-negative">{error}</p>
  if (hint) return <p className="mt-1.5 text-xs text-text-faint">{hint}</p>
  return null
}
