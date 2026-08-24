import { env } from '../../config/env'
export type ProblemDetails = { title?: string; detail?: string; status?: number }
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetails,
  ) {
    super(problem.detail ?? problem.title ?? `HTTP ${status}`)
  }
}
type Options = RequestInit & { timeoutMs?: number }
function resolveUrl(path: string): string {
  return path.startsWith('/') ? path : `${env.apiBaseUrl}/${path}`
}
async function request<T>(path: string, options: Options = {}): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? env.requestTimeoutMs)
  try {
    const response = await fetch(resolveUrl(path), {
      ...options,
      credentials: 'include',
      headers: { Accept: 'application/json', ...options.headers },
      signal: controller.signal,
    })
    if (!response.ok) {
      let problem: ProblemDetails = {}
      try {
        problem = await response.json()
      } catch {
        /* response has no problem payload */
      }
      throw new HttpError(response.status, problem)
    }
    return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>)
  } finally {
    clearTimeout(timer)
  }
}
export const httpClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
}
