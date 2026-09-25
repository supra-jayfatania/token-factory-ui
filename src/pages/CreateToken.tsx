import { useQueryClient } from '@tanstack/react-query'
import { Coins } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FieldHint, MintLimitsFields } from '../components/MintLimitsFields'
import { PageHeading } from '../components/PageHeading'
import { TokenAvatar } from '../components/TokenAvatar'
import { Button } from '../components/ui/Button'
import { Card, CardDescription, CardTitle } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { describeContractError } from '../lib/errors'
import { EMPTY_MINT_LIMITS, validateMintLimits, type MintLimitsInput } from '../lib/mintLimitsForm'
import { readTokensByCreator } from '../lib/reads/factory'
import { createToken } from '../lib/tx/factory'
import { formatAmount, formatDuration, invalidAmountMessage, parseAmount } from '../lib/units'

const DECIMAL_PRESETS = [6, 8, 18]

export function CreateToken() {
  const { address, walletClient } = useWallet()
  const { publicClient, contracts } = useChain()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimalsInput, setDecimalsInput] = useState('18')
  const [maxSupplyInput, setMaxSupplyInput] = useState('')
  const [limitsInput, setLimitsInput] = useState<MintLimitsInput>(EMPTY_MINT_LIMITS)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const decimals = /^\d+$/.test(decimalsInput) && Number(decimalsInput) <= 255 ? Number(decimalsInput) : undefined
  const decimalsError = decimalsInput && decimals === undefined ? 'Whole number from 0 to 255.' : undefined

  // Empty or 0 = uncapped, per the doc.
  const maxSupply = maxSupplyInput.trim() === '' ? 0n : decimals !== undefined ? parseAmount(maxSupplyInput, decimals) : undefined
  const maxSupplyError =
    maxSupplyInput && decimals !== undefined && maxSupply === undefined
      ? `${invalidAmountMessage(maxSupplyInput, decimals)} Or leave empty for no cap.`
      : undefined

  const { limits, errors: limitErrors } = validateMintLimits(limitsInput, decimals ?? 18)

  const canSubmit =
    Boolean(address && walletClient && contracts) &&
    name.trim() !== '' &&
    symbol.trim() !== '' &&
    decimals !== undefined &&
    maxSupply !== undefined &&
    limits !== undefined &&
    !isSubmitting

  const submit = async () => {
    if (!walletClient || !address || !contracts || decimals === undefined || maxSupply === undefined || !limits) return
    setIsSubmitting(true)
    const toastId = toast.loading('Confirm the transaction in your wallet…')
    const createdSymbol = symbol.trim()
    const factoryRead = { client: publicClient, factoryAddress: contracts.tokenFactory }
    try {
      const receipt = await createToken(
        { walletClient, publicClient, factoryAddress: contracts.tokenFactory },
        {
          name: name.trim(),
          symbol: createdSymbol,
          decimals,
          maxSupply,
          mintPeriod: limits.period,
          mintCapPerPeriod: limits.capPerPeriod,
          mintCapPerRequest: limits.capPerRequest,
        },
      )

      // The token exists from here on, so nothing below may report the create as failed.
      queryClient.invalidateQueries({ queryKey: ['tokenCount'] })
      queryClient.invalidateQueries({ queryKey: ['createdTokens'] })
      setName('')
      setSymbol('')
      setMaxSupplyInput('')

      // Only used for the toast's "Manage" shortcut. The factory registers tokens oldest-first under
      // their creator, so as of the receipt's block the newest one is ours; reading at that block
      // keeps a lagging RPC node from answering with the list from before it. On failure, skip the shortcut.
      const newToken = await readTokensByCreator(factoryRead, address, receipt.blockNumber)
        .then((created) => created.at(-1))
        .catch(() => undefined)

      toast.success(`${createdSymbol} created.`, {
        id: toastId,
        action: newToken ? { label: 'Manage', onClick: () => navigate(`/manage?token=${newToken}`) } : undefined,
      })
    } catch (error) {
      toast.error(describeContractError(error), { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewDecimals = decimals ?? 18
  const previewSupply = maxSupply !== undefined && maxSupply > 0n ? `${formatAmount(maxSupply, previewDecimals)} max` : 'No max supply'

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeading
        icon={Coins}
        title="Create token"
        subtitle="Deploys a new rate-limited ERC20 from the factory. Anyone can create one — you become its owner."
        align="center"
      />

      <Card className="space-y-6 p-6 sm:p-8">
        {!address && <p className="text-sm text-text-muted">Connect a wallet to create a token.</p>}

        <section className="space-y-4">
          <CardTitle>Basics</CardTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Token" disabled={!address} />
            </div>
            <div>
              <Label>Symbol</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="MTK"
                disabled={!address}
                className="font-mono"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <CardTitle>Supply</CardTitle>
            <CardDescription>Both fixed forever once the token is deployed.</CardDescription>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Decimals</Label>
              <div className="flex gap-2">
                <Input
                  value={decimalsInput}
                  onChange={(e) => setDecimalsInput(e.target.value)}
                  inputMode="numeric"
                  className="w-20 font-mono"
                  disabled={!address}
                />
                {DECIMAL_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    variant={decimals === preset ? 'secondary' : 'ghost'}
                    onClick={() => setDecimalsInput(String(preset))}
                    disabled={!address}
                    className="font-mono"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
              <FieldHint error={decimalsError} hint="18 is the ERC20 convention; 6 is typical for stablecoins." />
            </div>
            <div>
              <Label>Max supply</Label>
              <Input
                value={maxSupplyInput}
                onChange={(e) => setMaxSupplyInput(e.target.value)}
                inputMode="decimal"
                placeholder="No cap"
                className="font-mono"
                disabled={!address}
              />
              <FieldHint error={maxSupplyError} hint="In whole tokens. Leave empty (or 0) for unlimited supply." />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <CardTitle>Public mint limits</CardTitle>
            <CardDescription>
              Apply to everyone except you (the owner). You can change these later from Manage.
            </CardDescription>
          </div>
          <MintLimitsFields
            value={limitsInput}
            onChange={setLimitsInput}
            errors={limitErrors}
            symbol={symbol}
            disabled={!address}
          />
        </section>

        <div className="flex items-center gap-3 rounded-xl bg-surface-raised px-4 py-3">
          <TokenAvatar address={symbol || 'preview'} symbol={symbol || '??'} size="lg" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-text">{name || 'Token name'}</div>
            <div className="font-mono text-xs text-text-faint">
              {symbol || 'SYMBOL'} · {previewDecimals} decimals · {previewSupply}
            </div>
            {limits && (
              <div className="font-mono text-xs text-text-faint">
                {formatAmount(limits.capPerRequest, previewDecimals)}/request ·{' '}
                {formatAmount(limits.capPerPeriod, previewDecimals)} per {formatDuration(Number(limits.period))}
              </div>
            )}
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={submit} disabled={!canSubmit}>
          {isSubmitting && <Spinner className="h-4 w-4" />}
          {isSubmitting ? 'Creating…' : 'Create token'}
        </Button>
      </Card>
    </div>
  )
}
