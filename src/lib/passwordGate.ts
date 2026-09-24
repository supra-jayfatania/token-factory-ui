const STORAGE_KEY = 'token-factory-ui:site-password'

/**
 * This is a soft, client-side gate to keep casual visitors out — not real
 * access control. `VITE_*` env vars are inlined into the built JS bundle,
 * so the password is readable by anyone who opens dev tools; don't rely on
 * this to protect anything sensitive.
 */
const enabledFlag = import.meta.env.VITE_SITE_PASSWORD_ENABLED === 'true'
const password = import.meta.env.VITE_SITE_PASSWORD ?? ''

if (enabledFlag && !password) {
  console.warn(
    'VITE_SITE_PASSWORD_ENABLED is true but VITE_SITE_PASSWORD is empty — skipping the password gate so the site stays reachable.',
  )
}

export const isPasswordGateActive = enabledFlag && password !== ''

export function checkPassword(candidate: string): boolean {
  return isPasswordGateActive && candidate === password
}

export function hasValidSession(): boolean {
  if (!isPasswordGateActive) return true
  try {
    return sessionStorage.getItem(STORAGE_KEY) === password
  } catch {
    return false
  }
}

export function saveSession(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, password)
  } catch {
    // sessionStorage unavailable (private mode, etc.) — the unlock just won't survive a reload.
  }
}
