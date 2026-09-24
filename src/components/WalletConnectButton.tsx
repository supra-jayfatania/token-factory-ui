import { Wallet as WalletIcon } from 'lucide-react'
import { useState } from 'react'
import { useWallet } from '../context/WalletContext'
import { AccountMenu } from './AccountMenu'
import { Button } from './ui/Button'
import { WalletConnectModal } from './WalletConnectModal'

export function WalletConnectButton() {
  const { address } = useWallet()
  const [open, setOpen] = useState(false)

  if (address) return <AccountMenu />

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <WalletIcon className="h-4 w-4" />
        Connect wallet
      </Button>
      <WalletConnectModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
