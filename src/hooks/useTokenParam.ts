import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sameAddress } from '../lib/identicon'
import type { TokenInfo } from './useTokenList'

/**
 * The token selected via `?token=`. With no param, `fallback` is written into
 * the URL once so the selection stays put: token lists are newest-first, so
 * "the first token" changes whenever anyone creates one, which would otherwise
 * swap the page (and reset its form) onto a different token.
 *
 * `selected` is undefined when the param names a token that isn't in `tokens`
 * (yet) — callers decide whether to fall back or say so.
 */
export function useTokenParam(tokens: TokenInfo[], fallback: TokenInfo | undefined) {
  const [params, setParams] = useSearchParams()
  const param = params.get('token') ?? undefined

  const setToken = useCallback(
    (address: `0x${string}`) => setParams({ token: address }, { replace: true }),
    [setParams],
  )

  useEffect(() => {
    if (!param && fallback) setToken(fallback.address)
  }, [param, fallback, setToken])

  const selected = param ? tokens.find((t) => sameAddress(t.address, param)) : fallback
  return { param, selected, setToken }
}
