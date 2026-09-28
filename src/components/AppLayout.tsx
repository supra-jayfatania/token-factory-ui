import { Coins, Settings2, Sparkles, Wallet as WalletIcon } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../lib/cn'
import { NetworkSwitcher } from './NetworkSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { WalletConnectButton } from './WalletConnectButton'
import { WrongNetworkBanner } from './WrongNetworkBanner'

const NAV_ITEMS = [
  { to: '/', label: 'Mint', icon: Sparkles, end: true },
  { to: '/wallet', label: 'Wallet', icon: WalletIcon },
  { to: '/create', label: 'Create token', icon: Coins },
  { to: '/manage', label: 'Manage', icon: Settings2 },
]

export function AppLayout() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/supra-symbol.svg"
              alt="Supra"
              className="h-11 w-11 shrink-0 rounded-full shadow-[0_0_24px_-4px] shadow-accent/70"
            />
            <div className="leading-tight">
              <div className="text-xl font-bold tracking-tight text-text">
                ERC Token <span className="text-accent">Factory</span>
              </div>
              <div className="hidden text-xs font-medium tracking-wide text-text-muted sm:block">
                Create &amp; manage tokens on Supra EVM
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            <NetworkSwitcher />
            <ThemeToggle />
            <WalletConnectButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl flex-wrap gap-1.5 px-5 pb-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-text-muted transition-colors hover:bg-surface-raised hover:text-text',
                  isActive && 'bg-accent-soft text-accent',
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <WrongNetworkBanner />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-border px-5 py-4 text-center text-xs text-text-faint">
        Testnet only — tokens have no value.
      </footer>
    </div>
  )
}
