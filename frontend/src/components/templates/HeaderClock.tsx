import { useEffect, useState } from 'react'
import { formatBusinessTime } from '@/lib/business-time'

export function HeaderClock() {
  const [time, setTime] = useState(() => formatBusinessTime(true))

  useEffect(() => {
    const interval = window.setInterval(() => setTime(formatBusinessTime(true)), 1000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="flex min-w-0 flex-col items-end leading-none" aria-live="polite">
      <span className="text-[0.625rem] font-semibold tracking-wide text-text-muted">HORA</span>
      <time className="mt-1 text-sm font-bold tabular-nums text-text" dateTime={time}>
        <span className="hidden lg:inline">{time}</span>
        <span className="lg:hidden">{time.slice(0, 5)}</span>
      </time>
    </div>
  )
}
