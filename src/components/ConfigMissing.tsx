import { Settings } from 'lucide-react'

export function ConfigMissing() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-5">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft">
          <Settings className="h-5 w-5 text-accent" />
        </span>
        <h1 className="text-lg font-semibold text-text">Network not configured</h1>
        <p className="mt-2 text-sm text-text-muted">
          Set <code className="font-mono text-text">VITE_SUPRA_EVM_QA_CHAIN_ID</code> (a whole-number chain id) and{' '}
          <code className="font-mono text-text">VITE_SUPRA_EVM_QA_RPC_URL</code> in{' '}
          <code className="font-mono text-text">.env</code>, then restart the dev server.
        </p>
      </div>
    </div>
  )
}
