import { useEffect, useRef, useState } from 'react'
import { formatDuration } from '../lib/units'

/** Ticks once a second down to `targetMs`; calls `onElapsed` once when it reaches zero. */
export function Countdown({ targetMs, onElapsed }: { targetMs: number; onElapsed?: () => void }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remainingSeconds = Math.max(0, Math.ceil((targetMs - now) / 1000))
  const elapsed = remainingSeconds === 0

  const onElapsedRef = useRef(onElapsed)
  useEffect(() => {
    onElapsedRef.current = onElapsed
  })
  useEffect(() => {
    if (elapsed) onElapsedRef.current?.()
  }, [elapsed])

  return <span className="font-mono">{formatDuration(remainingSeconds)}</span>
}
