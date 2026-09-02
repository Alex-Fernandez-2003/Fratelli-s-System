import { BUSINESS_TIME_ZONE } from '../../lib/business-time'
import { HttpError } from '../../lib/api/http-client'
import type { AttendanceRecordDto } from './api'

type MinutesValue = number | string | null | undefined

function dateOnlyAsBusinessInstant(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12))
}

export function formatBusinessDate(value: string): string {
  const date = dateOnlyAsBusinessInstant(value)
  if (!date) return value
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatBusinessDateShort(value: string): string {
  const date = dateOnlyAsBusinessInstant(value)
  if (!date) return value
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: BUSINESS_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export const formatDateOnly = formatBusinessDate

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

export function formatDurationMinutes(value: MinutesValue): string {
  if (value === null || value === undefined || value === '') return '—'
  const minutes = Number(value)
  if (!Number.isFinite(minutes)) return '—'
  const wholeMinutes = Math.max(0, Math.trunc(minutes))
  const hours = Math.floor(wholeMinutes / 60)
  const remainder = wholeMinutes % 60
  return hours > 0 ? `${hours}h ${remainder}m` : `${remainder}m`
}

export const formatMinutes = formatDurationMinutes
export const formatWorkedMinutes = formatDurationMinutes

export function elapsedSince(iso: string, now = Date.now()): string {
  const ms = Math.max(0, now - new Date(iso).getTime())
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
