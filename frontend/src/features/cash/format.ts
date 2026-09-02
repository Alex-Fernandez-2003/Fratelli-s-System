import { BUSINESS_TIME_ZONE } from '@/lib/business-time'

export function formatMoney(value: number | string): string {
  return new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(
    Number(value),
  )
}

export function formatMoneyOrDash(value: number | string | null | undefined): string {
  const amount = typeof value === 'string' && value.trim() === '' ? Number.NaN : Number(value)
  return value === null || value === undefined || !Number.isFinite(amount)
    ? '—'
    : formatMoney(value)
}

export function formatSignedMoney(value: number | string | null | undefined): string {
  const amount = typeof value === 'string' && value.trim() === '' ? Number.NaN : Number(value)
  if (!Number.isFinite(amount)) return '—'
  return amount > 0 ? `+${formatMoney(amount)}` : formatMoney(amount)
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

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', { timeZone: BUSINESS_TIME_ZONE })
}

export function parseDeclaredCash(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null
  // Accept comma or dot, normalize comma
  const normalized = trimmed.replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return Number.NaN
  const n = Number(normalized)
  if (!Number.isFinite(n)) return Number.NaN
  return n
}

export type DifferenceKind = 'zero' | 'positive' | 'negative'
export type DifferenceSemantic = 'Sobrante' | 'Faltante' | 'Cuadrado'

export function differenceKind(diff: number): DifferenceKind {
  if (diff === 0) return 'zero'
  return diff > 0 ? 'positive' : 'negative'
}

export function differenceSemantic(diff: number | string): DifferenceSemantic {
  const amount = Number(diff)
  if (amount === 0) return 'Cuadrado'
  return amount > 0 ? 'Sobrante' : 'Faltante'
}

export function differenceLabel(diff: number | string): string {
  const semantic = differenceSemantic(diff)
  return semantic === 'Cuadrado' ? 'Caja cuadrada' : `${semantic} ${formatSignedMoney(diff)}`
}
