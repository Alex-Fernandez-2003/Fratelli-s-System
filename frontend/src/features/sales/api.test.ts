import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BUSINESS_TIME_ZONE, businessDate } from '@/lib/business-time'
import {
  createSalesHistoryFilters,
  fetchSaleDetail,
  fetchSalesHistory,
  salesDetailQueryOptions,
  salesHistoryKeys,
  salesHistoryScope,
  setSalesHistoryPage,
  updateSalesHistoryFilters,
  useSaleDetail,
  useSalesHistoryFilterState,
} from './api'

vi.mock('@/lib/api/http-client', () => ({
  httpClient: { get: vi.fn() },
}))

const { httpClient } = await import('@/lib/api/http-client')

describe('Sales History query layer', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uses the La Paz business day for both initial bounds and maps every real server filter', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ items: [], page: 2, pageSize: 25 })
    const initial = createSalesHistoryFilters(new Date('2026-08-31T02:30:00.000Z'))
    expect(BUSINESS_TIME_ZONE).toBe('America/La_Paz')
    expect(businessDate(new Date('2026-08-31T02:30:00.000Z'))).toBe('2026-08-30')
    expect(initial).toMatchObject({ from: '2026-08-30', to: '2026-08-30', page: 1 })

    await fetchSalesHistory({
      ...initial,
      page: 2,
      pageSize: 25,
      shiftId: 'shift-1',
      salesChannel: 'PEDIDOSYA',
      paymentMethod: 'EXTERNAL',
      customerSearch: ' Ana ',
    })

    expect(httpClient.get).toHaveBeenCalledWith(
      '/api/v1/sales?page=2&pageSize=25&from=2026-08-30&to=2026-08-30&shiftId=shift-1&salesChannel=PEDIDOSYA&paymentMethod=EXTERNAL&customerSearch=Ana',
    )
  })

  it('resets pagination for any filter change, preserves explicit page changes, and keys every normalized filter', () => {
    const pageFour = {
      from: '2026-08-30',
      to: '2026-08-30',
      page: 4,
      pageSize: 25,
      shiftId: 'shift-1',
      salesChannel: 'DIRECT' as const,
      paymentMethod: 'CASH' as const,
      customerSearch: ' Ana ',
    }
    expect(updateSalesHistoryFilters(pageFour, { paymentMethod: 'QR' })).toMatchObject({
      paymentMethod: 'QR',
      page: 1,
    })
    expect(setSalesHistoryPage(pageFour, 3)).toMatchObject({ page: 3, paymentMethod: 'CASH' })
    expect(salesHistoryKeys.list(pageFour)).toEqual(
      salesHistoryKeys.list({ ...pageFour, customerSearch: 'Ana' }),
    )
    expect(salesHistoryKeys.list(pageFour)).not.toEqual(
      salesHistoryKeys.list({ ...pageFour, shiftId: 'shift-2' }),
    )
    expect(salesHistoryKeys.list(pageFour)).not.toEqual(
      salesHistoryKeys.list({ ...pageFour, paymentMethod: 'QR' }),
    )
  })

  it('provides consumer page state that resets filters but keeps explicit pagination', () => {
    const { result } = renderHook(() =>
      useSalesHistoryFilterState(new Date('2026-08-31T02:30:00.000Z')),
    )

    act(() => result.current.setPage(4))
    expect(result.current.filters.page).toBe(4)
    act(() => result.current.updateFilters({ customerSearch: 'Ana' }))
    expect(result.current.filters).toMatchObject({
      from: '2026-08-30',
      to: '2026-08-30',
      customerSearch: 'Ana',
      page: 1,
    })
  })

  it('keeps MESERO-only scope narrow but gives a multi-role user broad scope and disables detail until selected', async () => {
    expect(salesHistoryScope(['MESERO'])).toBe('assigned-shift')
    expect(salesHistoryScope(['MESERO', 'ENCARGADO'])).toBe('broad')
    expect(salesHistoryScope(['CONTADORA'])).toBe('broad')

    expect(salesDetailQueryOptions(undefined).enabled).toBe(false)
    expect(salesDetailQueryOptions('sale-1')).toMatchObject({
      queryKey: ['sales', 'detail', 'sale-1'],
      enabled: true,
    })
    await fetchSaleDetail('sale-1')
    expect(httpClient.get).toHaveBeenLastCalledWith('/api/v1/sales/sale-1')
  })

  it('does not fetch detail without a selection, then fetches only the selected sale', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ id: 'sale-2', items: [] })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client }, children)
    const { rerender } = renderHook(({ id }) => useSaleDetail(id), {
      initialProps: { id: undefined as string | undefined },
      wrapper,
    })

    expect(httpClient.get).not.toHaveBeenCalled()
    rerender({ id: 'sale-2' })
    await waitFor(() => expect(httpClient.get).toHaveBeenCalledWith('/api/v1/sales/sale-2'))
  })
})
