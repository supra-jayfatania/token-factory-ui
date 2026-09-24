import { Coins } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeading } from '../components/PageHeading'
import { TokenAvatar } from '../components/TokenAvatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Input, Label } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { useRole } from '../hooks/useRole'
import { describeContractError } from '../lib/errors'
import { createRegularToken, createStableToken } from '../lib/tx/factory'

export function CreateToken() {
  const { address, walletClient } = useWallet()
  const { publicClient, contracts } = useChain()
  const { canCreateToken, isMasterOwner, isSubOwner, isLoading: roleLoading } = useRole()

  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [decimals, setDecimals] = useState<6 | 18>(18)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const disabled = !address || !canCreateToken || !name || !symbol || isSubmitting

  const submit = async () => {
    if (!walletClient || !contracts) return
    setIsSubmitting(true)
    const toastId = toast.loading('Confirm the transaction in your wallet…')
    try {
      const tx = { walletClient, publicClient, factoryAddress: contracts.tokenFactory }
      if (decimals === 6) {
        await createStableToken(tx, name, symbol)
      } else {
        await createRegularToken(tx, name, symbol)
      }
      toast.success(`${symbol} created.`, { id: toastId })
      setName('')
      setSymbol('')
    } catch (error) {
      toast.error(describeContractError(error), { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeading
        icon={Coins}
        title="Create token"
        subtitle="Deploys a new token from this factory. Master and sub owners only."
        align="center"
      />

      <Card className="p-6 sm:p-8">
        {address && !roleLoading && (
          <CardHeader>
            <CardTitle className="text-sm font-medium text-text-muted">Your access</CardTitle>
            <Badge tone={canCreateToken ? 'positive' : 'neutral'}>
              {isMasterOwner ? 'Master owner' : isSubOwner ? 'Sub owner' : 'No create access'}
            </Badge>
          </CardHeader>
        )}

        {!address && <p className="text-sm text-text-muted">Connect a wallet to continue.</p>}

        {address && !roleLoading && !canCreateToken && (
          <p className="mb-4 rounded-lg border border-border bg-surface-raised p-3 text-sm text-text-muted">
            This wallet isn't a master or sub owner on this factory, so token creation will
            revert. The form below is still shown for reference.
          </p>
        )}

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Test Coin"
                disabled={!address}
              />
            </div>
            <div>
              <Label>Symbol</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="TCOIN"
                disabled={!address}
                className="font-mono"
              />
            </div>
          </div>

          <div>
            <Label>Decimals</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(
                [
                  { value: 6 as const, hint: 'Stablecoin-style, e.g. tUSD' },
                  { value: 18 as const, hint: 'Regular token, e.g. tCOIN' },
                ] as const
              ).map(({ value, hint }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDecimals(value)}
                  disabled={!address}
                  className={`rounded-xl border p-3 text-left transition-colors disabled:opacity-40 ${
                    decimals === value
                      ? 'border-accent bg-accent-soft'
                      : 'border-border bg-surface-raised hover:border-accent/40'
                  }`}
                >
                  <div
                    className={`font-mono text-lg font-bold ${decimals === value ? 'text-accent' : 'text-text'}`}
                  >
                    {value}
                  </div>
                  <div className="text-xs text-text-muted">{hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-surface-raised px-4 py-3">
            <TokenAvatar address={symbol || 'preview'} symbol={symbol || '??'} size="lg" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-text">
                {name || 'Token name'}
              </div>
              <div className="font-mono text-xs text-text-faint">
                {symbol || 'SYMBOL'} · {decimals} decimals
              </div>
            </div>
          </div>

          <Button className="w-full" size="lg" onClick={submit} disabled={disabled}>
            {isSubmitting && <Spinner className="h-4 w-4" />}
            {isSubmitting ? 'Creating…' : 'Create token'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
