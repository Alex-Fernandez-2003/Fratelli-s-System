import { HttpError } from '../../lib/api/http-client'
import type { AttendanceRecordDto } from './api'

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function recordDuration(record: Pick<AttendanceRecordDto, 'checkInAt' | 'checkOutAt'>): string {
  if (!record.checkOutAt) return 'En curso'
  const ms = new Date(record.checkOutAt).getTime() - new Date(record.checkInAt).getTime()
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function totalDuration(records: AttendanceRecordDto[]): string {
  const closed = records.filter((r) => r.checkOutAt)
  if (!closed.length) return '—'
  const ms = closed.reduce(
    (acc, r) => acc + (new Date(r.checkOutAt as string).getTime() - new Date(r.checkInAt).getTime()),
    0,
  )
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return `${hours}h ${minutes}m`
}

export function errorMessage(error: unknown, fallback = 'No se pudo completar la operación.'): string {
  if (error instanceof HttpError) {
    return error.problem.detail ?? error.problem.title ?? fallback
  }
  return fallback
}
