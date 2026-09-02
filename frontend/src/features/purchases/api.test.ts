import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createPurchaseHistoryFilters,
  fetchPurchaseDetail,
  fetchPurchaseHistory,
  purchaseHistoryKeys,
  purchaseHistoryScope,
  useCancelPurchase,
  useCreatePurchase,
  useReceivePurchase,
  usePurchaseDetail,
} from './api'

vi.mock('@/lib/api/http-client', () => ({ httpClient: { get: vi.fn(), post: vi.fn() } }))
const { httpClient } = await import('@/lib/api/http-client')

describe('Purchase history query layer', () => {
  beforeEach(() => vi.clearAllMocks())

  it('defaults to the last 30 business dates and sends history filters plus pagination', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ items: [], page: 2, pageSize: 25 })
    const initial = createPurchaseHistoryFilters(new Date('2026-08-31T02:30:00.000Z'))
    expect(initial).toMatchObject({ from: '2026-08-01', to: '2026-08-30', page: 1, pageSize: 25 })

    await fetchPurchaseHistory({
      ...initial,
      page: 2,
      supplierId: 'supplier-1',
      purchaseArea: 'KITCHEN',
      status: 'RECIBIDA',
      responsible: 'not-a-ui-filter',
    })
    expect(httpClient.get).toHaveBeenCalledWith(
      '/api/v1/purchases/history?page=2&pageSize=25&status=RECIBIDA&supplierId=supplier-1&purchaseArea=KITCHEN&from=2026-08-01&to=2026-08-30',
    )
  })

  it('keeps UUIDs intact for detail requests and scopes pure COCINA without an ALL option', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000'
    vi.mocked(httpClient.get).mockResolvedValue({ id })
    expect(purchaseHistoryScope(['COCINA'])).toBe('cocina')
    expect(purchaseHistoryScope(['COCINA', 'ENCARGADO'])).toBe('broad')
    expect(purchaseHistoryScope(['CONTADORA'])).toBe('broad')
    await fetchPurchaseDetail(id)
    expect(httpClient.get).toHaveBeenCalledWith(`/api/v1/purchases/history/${id}`)
    expect(purchaseHistoryKeys.detail(id)).toEqual(['purchases', 'history', 'detail', id])
  })

  it('does not fetch an unselected detail and targets history/inventory invalidation after receive', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ id: 'purchase-1', items: [] })
    vi.mocked(httpClient.post).mockResolvedValue({ id: 'purchase-1' })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children)
    const detail = renderHook(() => usePurchaseDetail(''), { wrapper })
    expect(detail.result.current.fetchStatus).toBe('idle')
    const receive = renderHook(() => useReceivePurchase(), { wrapper })
    await act(async () => {
      await receive.result.current.mutateAsync({
        id: 'purchase-1',
        request: { lines: [], notes: null },
      })
    })
    await waitFor(() => expect(invalidate).toHaveBeenCalled())
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['purchases', 'history'] })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['purchases', 'history', 'detail', 'purchase-1'],
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['inventory'] })
  })

  it('invalidates only purchase history after create', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ id: 'purchase-1' })
    const client = new QueryClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children)
    const create = renderHook(() => useCreatePurchase(), { wrapper })
    await act(async () => {
      await create.result.current.mutateAsync({
        supplierId: 'supplier-1',
        lines: [{ productId: 'product-1', quantity: 1, unitId: 'unit-1', unitCost: 2 }],
        receiptReference: null,
        notes: null,
      })
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['purchases', 'history'] })
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['purchases'] })
  })

  it('targets the cancelled history detail without global invalidation', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ id: 'purchase-1' })
    const client = new QueryClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children)
    const cancel = renderHook(() => useCancelPurchase(), { wrapper })
    await act(async () => {
      await cancel.result.current.mutateAsync({
        id: 'purchase-1',
        request: { reason: 'Factura anulada' },
      })
    })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['purchases', 'history'] })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['purchases', 'history', 'detail', 'purchase-1'],
    })
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['purchases'] })
  })
})
