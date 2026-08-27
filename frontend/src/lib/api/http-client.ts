import { env } from '../../config/env'
import { sessionCoordinator } from '../auth/session-coordinator'

export type ProblemDetails = { title?: string; detail?: string; status?: number }
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetails,
  ) {
    super(problem.detail ?? problem.title ?? `HTTP ${status}`)
  }
}

type Options = RequestInit & { timeoutMs?: number; auth?: 'raw' }
type RefreshHandler = () => Promise<unknown>
let refreshHandler: RefreshHandler | undefined

export function setSessionRefreshHandler(handler: RefreshHandler | undefined) {
  refreshHandler = handler
}

function resolveUrl(path: string): string {
  return path.startsWith('/') ? path : `${env.apiBaseUrl}/${path}`
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let problem: ProblemDetails = {}
    try {
      problem = (await response.json()) as ProblemDetails
    } catch {
      // Response has no ProblemDetails payload.
    }
    throw new HttpError(response.status, problem)
  }
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>)
}

async function transport<T>(path: string, options: Options, authenticated: boolean): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? env.requestTimeoutMs)
  try {
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    if (authenticated && sessionCoordinator.getAccessToken()) {
      headers.set('Authorization', `Bearer ${sessionCoordinator.getAccessToken()}`)
    } else {
      headers.delete('Authorization')
    }
    const response = await fetch(resolveUrl(path), {
      ...options,
      credentials: 'include',
      headers,
      signal: controller.signal,
    })
    return parseResponse<T>(response)
  } finally {
    clearTimeout(timer)
  }
}

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const raw = options.auth === 'raw'
  try {
    return await transport<T>(path, options, !raw)
  } catch (error) {
    if (raw || !(error instanceof HttpError) || error.status !== 401 || !refreshHandler) throw error
    await refreshHandler()
    return transport<T>(path, options, true)
  }
}

export const httpClient = {
  get: <T>(path: string, options?: Options) => request<T>(path, options),
  post: <T>(path: string, body?: unknown, options: Options = {}) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(path: string, body?: unknown, options: Options = {}) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string, options: Options = {}) =>
    request<T>(path, { ...options, method: 'DELETE' }),
}
