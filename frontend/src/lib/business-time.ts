export const BUSINESS_TIME_ZONE = 'America/La_Paz'
export const BUSINESS_LOCATION_LABEL = 'Tarija, Bolivia'

export function formatBusinessTime(includeSeconds = false): string {
  return new Intl.DateTimeFormat('es-BO', {
    timeZone: BUSINESS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...(includeSeconds ? { second: '2-digit' } : {}),
    hour12: false,
  }).format(new Date())
}

export function businessDate(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value
  return `${value('year')}-${value('month')}-${value('day')}`
}
