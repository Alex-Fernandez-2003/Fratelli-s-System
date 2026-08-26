import { describe, expect, it } from 'vitest'
import { ordersKeys } from './api'
describe('orders query keys', () => {
  it('normalizes blank search and differentiates filters', () => {
    expect(ordersKeys.list({ page: 1, pageSize: 10, search: ' ' })).toEqual(
      ordersKeys.list({ page: 1, pageSize: 10 }),
    )
    expect(ordersKeys.list({ page: 1, pageSize: 10, status: 'LISTO' })).not.toEqual(
      ordersKeys.list({ page: 1, pageSize: 10, status: 'PENDIENTE' }),
    )
  })
})
