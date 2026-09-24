import { useQuery } from '@tanstack/react-query'
import { Shield } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '../components/EmptyState'
import { PageHeading } from '../components/PageHeading'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardDescription, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { useChain } from '../context/ChainContext'
import { useWallet } from '../context/WalletContext'
import { useRole } from '../hooks/useRole'
import { describeContractError } from '../lib/errors'
import { readMasterOwnerCount } from '../lib/reads/factory'
import { addMasterOwner, addSubOwner, removeMasterOwner, removeSubOwner } from '../lib/tx/factory'

export function AdminRoles() {
  const { address, walletClient } = useWallet()
  const { publicClient, contracts, chainId } = useChain()
  const { isMasterOwner, isLoading: roleLoading } = useRole()

  const masterOwnerCountQuery = useQuery({
    queryKey: ['masterOwnerCount', chainId],
    enabled: Boolean(contracts),
    queryFn: () =>
      readMasterOwnerCount({ client: publicClient, factoryAddress: contracts!.tokenFactory }),
  })

  if (!address) return <EmptyState text="Connect a wallet to continue." />
  if (roleLoading) return <EmptyState text="Checking access…" />
  if (!isMasterOwner) {
    return <EmptyState text="Only a master owner can manage roles. This wallet isn't one." />
  }

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    const toastId = toast.loading(`${label}…`)
    try {
      await action()
      toast.success(`${label} done.`, { id: toastId })
      masterOwnerCountQuery.refetch()
    } catch (error) {
      toast.error(describeContractError(error), { id: toastId })
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeading
        icon={Shield}
        title="Admin: roles"
        subtitle="Master owner only."
        action={<Badge tone="neutral">{masterOwnerCountQuery.data?.toString() ?? '—'} master owner(s)</Badge>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-1">Master owners</CardTitle>
          <CardDescription className="mb-4">Can manage roles, config, and pauses.</CardDescription>
          <RoleForm
            onAdd={(addr) =>
              runAction('Add master owner', () =>
                addMasterOwner({ walletClient: walletClient!, publicClient, factoryAddress: contracts!.tokenFactory }, addr),
              )
            }
            onRemove={(addr) => {
              if (masterOwnerCountQuery.data === 1n) {
                toast.error("You can't remove the last master owner.")
                return
              }
              return runAction('Remove master owner', () =>
                removeMasterOwner({ walletClient: walletClient!, publicClient, factoryAddress: contracts!.tokenFactory }, addr),
              )
            }}
          />
        </Card>

        <Card>
          <CardTitle className="mb-1">Sub owners</CardTitle>
          <CardDescription className="mb-4">Can create tokens and mint/faucet with a cap.</CardDescription>
          <RoleForm
            onAdd={(addr) =>
              runAction('Add sub owner', () =>
                addSubOwner({ walletClient: walletClient!, publicClient, factoryAddress: contracts!.tokenFactory }, addr),
              )
            }
            onRemove={(addr) =>
              runAction('Remove sub owner', () =>
                removeSubOwner({ walletClient: walletClient!, publicClient, factoryAddress: contracts!.tokenFactory }, addr),
              )
            }
          />
        </Card>
      </div>
    </div>
  )
}

function RoleForm({
  onAdd,
  onRemove,
}: {
  onAdd: (address: `0x${string}`) => Promise<void> | void
  onRemove: (address: `0x${string}`) => Promise<void> | void
}) {
  const [address, setAddress] = useState('')
  const [pending, setPending] = useState<'add' | 'remove' | null>(null)

  const run = async (kind: 'add' | 'remove') => {
    if (!address) return
    setPending(kind)
    try {
      await (kind === 'add' ? onAdd : onRemove)(address as `0x${string}`)
      setAddress('')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="0x…"
        className="font-mono"
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={() => run('add')}
        disabled={!address || pending !== null}
      >
        {pending === 'add' ? <Spinner className="h-3.5 w-3.5" /> : 'Add'}
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => run('remove')}
        disabled={!address || pending !== null}
      >
        {pending === 'remove' ? <Spinner className="h-3.5 w-3.5" /> : 'Remove'}
      </Button>
    </div>
  )
}
