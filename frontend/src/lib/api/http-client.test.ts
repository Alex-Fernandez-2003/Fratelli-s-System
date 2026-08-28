import { afterEach, describe, expect, it, vi } from 'vitest'
import { sessionCoordinator } from '../auth/session-coordinator'
import { httpClient, setSessionRefreshHandler } from './http-client'

const response = (status: number, body: unknown = {}) =>
  new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

describe('httpClient authentication policy', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    sessionCoordinator.clear()
    setSessionRefreshHandler(undefined)
  })

  it('adds the current bearer immediately before dispatch and bypasses it for raw auth requests', async () => {
    sessionCoordinator.accept({ accessToken: 'token-a' })
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(response(200, { ok: true })))
    vi.stubGlobal('fetch', fetchMock)
    await httpClient.get('/api/items', { headers: { 'X-Caller': 'yes' } })
    await httpClient.post('/api/v1/auth/refresh', undefined, { auth: 'raw' })
    expect(fetchMock.mock.calls[0][1].headers.get('Authorization')).toBe('Bearer token-a')
    expect(fetchMock.mock.calls[0][1].headers.get('X-Caller')).toBe('yes')
    expect(fetchMock.mock.calls[1][1].headers.get('Authorization')).toBeNull()
  })

  it('refreshes once after an eligible 401 and rebuilds the retry headers and body', async () => {
    sessionCoordinator.accept({ accessToken: 'old' })
    const refresh = vi
      .fn()
      .mockImplementation(async () => sessionCoordinator.accept({ accessToken: 'new' }))
    setSessionRefreshHandler(refresh)
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(response(401, { title: 'expired' }))
      .mockResolvedValueOnce(response(200, { ok: true }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      httpClient.post('/api/items?scope=a', { name: 'item' }, { headers: { 'X-Caller': 'yes' } }),
    ).resolves.toEqual({ ok: true })
    expect(refresh).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1][1].headers.get('Authorization')).toBe('Bearer new')
    expect(fetchMock.mock.calls[1][1].headers.get('X-Caller')).toBe('yes')
    expect(fetchMock.mock.calls[1][1].body).toBe(JSON.stringify({ name: 'item' }))
  })

  it('does not refresh for non-401 errors, network failures, or a retry 401', async () => {
    sessionCoordinator.accept({ accessToken: 'token' })
    const refresh = vi.fn().mockResolvedValue(undefined)
    setSessionRefreshHandler(refresh)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    for (const status of [400, 403, 404, 409, 500]) {
      fetchMock.mockResolvedValueOnce(response(status, { title: `status-${status}` }))
      await expect(httpClient.get('/api/items')).rejects.toMatchObject({ status })
    }
    fetchMock.mockRejectedValueOnce(new TypeError('network'))
    await expect(httpClient.get('/api/items')).rejects.toThrow('network')
    expect(refresh).not.toHaveBeenCalled()

    fetchMock.mockResolvedValueOnce(response(401)).mockResolvedValueOnce(response(401))
    await expect(httpClient.get('/api/items')).rejects.toMatchObject({ status: 401 })
    expect(refresh).toHaveBeenCalledOnce()
  })

  it('shares one refresh across five concurrent 401s and retries each request once', async () => {
    sessionCoordinator.accept({ accessToken: 'old' })
    let resolveRefresh!: () => void
    const refreshOperation = vi.fn(
      () =>
        new Promise<{ accessToken: string }>((resolve) => {
          resolveRefresh = () => resolve({ accessToken: 'new' })
        }),
    )
    setSessionRefreshHandler(() => sessionCoordinator.refresh(refreshOperation))
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(response(401)))
    vi.stubGlobal('fetch', fetchMock)

    const requests = Array.from({ length: 5 }, (_, index) => httpClient.get(`/api/items/${index}`))
    await vi.waitFor(() => expect(refreshOperation).toHaveBeenCalledOnce())
    resolveRefresh()
    fetchMock.mockImplementation(() => Promise.resolve(response(200, { ok: true })))
    await expect(Promise.all(requests)).resolves.toEqual(Array(5).fill({ ok: true }))
    expect(fetchMock).toHaveBeenCalledTimes(10)
    expect(refreshOperation).toHaveBeenCalledOnce()
  })
})
