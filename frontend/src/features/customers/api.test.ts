import { describe, expect, it, vi } from 'vitest'
import { customerKeys, fetchCustomers, invalidateCustomers } from './api'

vi.mock('@/lib/api/http-client', () => ({
  httpClient: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const { httpClient } = await import('@/lib/api/http-client')

describe('Customer API', () => {
  it('maps every list filter to the server request and has deterministic distinct keys', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({
      items: [],
      page: 2,
      pageSize: 25,
      totalCount: 0,
      totalPages: 0,
    })
    const filters = { page: 2, pageSize: 25, search: ' Ana ', isActive: false }
    await fetchCustomers(filters)
    expect(httpClient.get).toHaveBeenCalledWith(
      '/api/v1/customers?page=2&pageSize=25&search=Ana&isActive=false',
    )
    expect(customerKeys.list(filters)).toEqual(customerKeys.list({ ...filters }))
    expect(customerKeys.list(filters)).not.toEqual(customerKeys.list({ ...filters, page: 1 }))
    expect(customerKeys.list(filters)).not.toEqual(
      customerKeys.list({ ...filters, isActive: true }),
    )
  })

  it('invalidates only the Customer query root after mutations', async () => {
    const invalidateQueries = vi.fn().mockResolvedValue(undefined)
    await invalidateCustomers({
      invalidateQueries,
    } as unknown as import('@tanstack/react-query').QueryClient)
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['customers'] })
  })
})
