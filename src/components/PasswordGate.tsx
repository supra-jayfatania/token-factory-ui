import { Lock } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { checkPassword, hasValidSession, isPasswordGateActive, saveSession } from '../lib/passwordGate'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

export function PasswordGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => !isPasswordGateActive || hasValidSession())
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (unlocked) return <>{children}</>

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (checkPassword(value)) {
      saveSession()
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft">
            <Lock className="h-5 w-5 text-accent" />
          </span>
          <h1 className="text-lg font-bold text-text">Password protected</h1>
          <p className="mt-1 text-sm text-text-muted">Enter the password to continue.</p>
        </div>

        <Input
          type="password"
          autoFocus
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(false)
          }}
          placeholder="Password"
        />
        {error && <p className="mt-2 text-sm text-negative">Incorrect password.</p>}

        <Button type="submit" className="mt-4 w-full" disabled={!value}>
          Unlock
        </Button>
      </form>
    </div>
  )
}
