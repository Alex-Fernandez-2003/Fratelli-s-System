import { HttpError } from '@/lib/api/http-client'
import { BUSINESS_TIME_ZONE } from '@/lib/business-time'
import type { ShiftStatus, ShiftType } from './api'

export const SHIFT_TYPE_LABEL: Record<ShiftType, string> = {
  MORNING: 'Turno Mañana',
  NIGHT: 'Turno Noche',
}

/**
 * Horario ilustrativo de cada turno fijo. El contrato de HU-025 no expone
 * horas de inicio/fin (solo `type`/`status`/`employeeIds`); este texto es
 * copia estática, no un dato persistido.
 */
export const SHIFT_TYPE_SCHEDULE: Record<ShiftType, string> = {
  MORNING: '08:00 – 16:00',
  NIGHT: '16:00 – Cierre',
}

export const SHIFT_STATUS_LABEL: Record<ShiftStatus, string> = {
  PENDING: 'Pendiente',
  ACTIVE: 'Activo',
  COMPLETED: 'Completado',
}

export const SHIFT_STATUS_TONE: Record<ShiftStatus, 'neutral' | 'success' | 'warning'> = {
  PENDING: 'neutral',
  ACTIVE: 'warning',
  COMPLETED: 'success',
}

export function formatBusinessDateLong(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: BUSINESS_TIME_ZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)))
}

export function todayBusinessDate(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts()
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function shiftErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 403) return 'No tenés permisos para realizar esta acción.'
    if (error.status === 404) return 'No se encontró el turno indicado.'
    if (error.status === 409)
      return (
        error.problem.detail ?? 'La operación entra en conflicto con el estado actual del turno.'
      )
  }
  return 'No se pudo completar la operación. Intentá nuevamente.'
}
