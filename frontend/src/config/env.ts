const fallbackApiBaseUrl = '/api/v1'
const fallbackRequestTimeoutMs = 10_000

function readAppName(value: string | undefined): string {
  return value?.trim() || 'Fratelli'
}

function readApiBaseUrl(value: string | undefined): string {
  return value?.startsWith('/') ? value : fallbackApiBaseUrl
}

function readRequestTimeoutMs(value: string | undefined): number {
  const timeout = Number(value)
  return Number.isFinite(timeout) && timeout > 0 ? timeout : fallbackRequestTimeoutMs
}

export const env = {
  appName: readAppName(import.meta.env.VITE_APP_NAME),
  apiBaseUrl: readApiBaseUrl(import.meta.env.VITE_API_BASE_URL),
  requestTimeoutMs: readRequestTimeoutMs(import.meta.env.VITE_REQUEST_TIMEOUT_MS),
} as const
