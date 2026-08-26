import { useEffect, useState } from 'react'
function format(milliseconds: number) {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}
export function ElapsedTime({ origin }: { origin: string }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return <span>{format(now - new Date(origin).getTime())}</span>
}
