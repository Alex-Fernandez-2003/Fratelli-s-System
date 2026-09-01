import { describe, expect, it, vi, beforeEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { cashApi, cashKeys } from './api'
import { shiftKeys } from '@/features/shifts/api'

vi.mock('@/lib/api/http-client', () => ({
  httpClient: { get: vi.fn(), post: vi.fn() },
  HttpError: class HttpError extends Error {
    constructor(
      public status: number,
      public problem: Record<string, unknown> = {},
    ) {
      super(`HTTP ${status}`)
    }
  },
}))

const { httpClient } = await import('@/lib/api/http-client')
const { useCloseCash } = await import('./api')
import { renderHook, waitFor } from '@testing-library/react'
import { createElement } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'

function wrapper(client: QueryClient) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client }, children)
}

describe('cash API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetches preview from GET /api/v1/cash/preview', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ expectedCash: 100 })
    const result = await cashApi.preview()
    expect(httpClient.get).toHaveBeenCalledWith('/api/v1/cash/preview')
    expect(result).toEqual({ expectedCash: 100 })
  })

  it('posts close to POST /api/v1/cash/close with exact CloseCashRequest', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ id: 'x' })
    const req = { declaredCash: 1500, observation: null as string | null }
    await cashApi.close(req)
    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/cash/close', req)
  })

  it('cashKeys are deterministic', () => {
    expect(cashKeys.preview()).toEqual(['cash', 'preview'])
    expect(cashKeys.all).toEqual(['cash'])
  })

  it('invalidates cash preview and shift context/mine on success', async () => {
    const client = new QueryClient()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    vi.mocked(httpClient.post).mockResolvedValue({ id: 'closing-1' })

    const { result } = renderHook(() => useCloseCash(), { wrapper: wrapper(client) })
    await result.current.mutateAsync({ declaredCash: 100, observation: null })
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled())
    // must invalidate cash preview
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: cashKeys.preview() })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: shiftKeys.context })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: shiftKeys.mine })
  })

  it('on 409 invalidates but does not retry mutation automatically', async () => {
    const client = new QueryClient()
    const invalidateSpy = vi.spyOn(client, 'invalidateQueries')
    const error = new (await import('@/lib/api/http-client')).HttpError(409, {
      detail: 'La caja ya fue cerrada.',
    })
    vi.mocked(httpClient.post).mockRejectedValue(error)
    const { result } = renderHook(() => useCloseCash(), { wrapper: wrapper(client) })
    await expect(
      result.current.mutateAsync({ declaredCash: 100, observation: null }),
    ).rejects.toEqual(error)
    // onError path should have invalidated
    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled())
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: cashKeys.preview() })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: shiftKeys.context })
    // no automatic retry: httpClient.post called exactly once
    expect(httpClient.post).toHaveBeenCalledTimes(1)
  })
})
