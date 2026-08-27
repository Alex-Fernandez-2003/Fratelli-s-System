import { useEffect, useState } from 'react'

function formatBoliviaTime(): string {
  return new Date().toLocaleTimeString('es-BO', {
    timeZone: 'America/La_Paz',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function HeaderClock() {
  const [time, setTime] = useState(formatBoliviaTime)

  useEffect(() => {
    const interval = setInterval(() => setTime(formatBoliviaTime()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className="text-sm font-bold tabular-nums text-text-muted" aria-live="polite">
      HORA ACTUAL {time}
    </span>
  )
}
