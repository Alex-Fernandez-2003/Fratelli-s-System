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
