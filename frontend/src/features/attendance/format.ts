import { BUSINESS_TIME_ZONE } from '../../lib/business-time'
import { HttpError } from '../../lib/api/http-client'
import type { AttendanceRecordDto } from './api'

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-BO', {
    timeZone: BUSINESS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', {
    timeZone: BUSINESS_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDayShort(iso: string): string {
  return new Date(iso).toLocaleDateString('es-BO', {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function recordDuration(
  record: Pick<AttendanceRecordDto, 'checkInAt' | 'checkOutAt'>,
): string {
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
    (acc, r) =>
      acc + (new Date(r.checkOutAt as string).getTime() - new Date(r.checkInAt).getTime()),
    0,
  )
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return `${hours}h ${minutes}m`
}

export function elapsedSince(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

export function errorMessage(
  error: unknown,
  fallback = 'No se pudo completar la operación.',
): string {
  if (error instanceof HttpError) {
    return error.problem.detail ?? error.problem.title ?? fallback
  }
  return fallback
}
