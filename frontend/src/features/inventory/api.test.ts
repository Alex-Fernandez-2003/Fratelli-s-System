import { describe, expect, it, vi } from 'vitest'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@/lib/api/http-client', () => ({ httpClient: { get, post } }))

import { inventoryApi, inventoryKeys } from './api'

describe('inventory API adapter', () => {
  it('uses the shared client and generated route for balances', async () => {
    get.mockResolvedValueOnce({ items: [] })
    await inventoryApi.balances({
      page: 1,
      pageSize: 20,
      search: 'tomate',
      productType: 'INGREDIENT',
    })
    expect(get).toHaveBeenCalledWith(
      '/api/v1/inventory/balances?page=1&pageSize=20&search=tomate&productType=INGREDIENT',
    )
  })

  it('uses the shared client for movement history and creation', async () => {
    get.mockResolvedValueOnce({ items: [] })
    post.mockResolvedValueOnce({ id: 'movement' })
    await inventoryApi.movements({ page: 1, pageSize: 20, movementType: 'WRITE_OFF' })
    await inventoryApi.create({
      productId: 'product',
      type: 'WRITE_OFF',
      quantity: 1.25,
      reason: 'Mermas',
    })
    expect(get).toHaveBeenCalledWith(
      '/api/v1/inventory/movements?page=1&pageSize=20&movementType=WRITE_OFF',
    )
    expect(post).toHaveBeenCalledWith('/api/v1/inventory/movements', {
      productId: 'product',
      type: 'WRITE_OFF',
      quantity: 1.25,
      reason: 'Mermas',
    })
  })

  it('separates serialized balance and movement query keys', () => {
    expect(inventoryKeys.balances({ page: 1, pageSize: 20 })).not.toEqual(
      inventoryKeys.movements({ page: 1, pageSize: 20 }),
    )
  })
})
