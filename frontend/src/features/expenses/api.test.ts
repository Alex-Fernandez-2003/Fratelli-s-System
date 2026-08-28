import { describe, expect, it, vi } from 'vitest'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@/lib/api/http-client', () => ({ httpClient: { get, post } }))

import { expenseKeys, expensesApi } from './api'

describe('expenses API adapter', () => {
  it('loads categories through the shared client', async () => {
    get.mockResolvedValueOnce([])
    await expensesApi.categories()
    expect(get).toHaveBeenCalledWith('/api/v1/expense-categories')
  })

  it('posts only the generated create-expense request', async () => {
    const request = {
      expenseCategoryId: null,
      amount: 12.5,
      cashSource: 'PETTY_CASH' as const,
      description: 'Limpieza',
      expenseDate: '2026-08-27',
    }
    post.mockResolvedValueOnce({ id: 'expense' })
    await expensesApi.create(request)
    expect(post).toHaveBeenCalledWith('/api/v1/expenses', request)
    expect(expenseKeys.categories()).toEqual(['expenses', 'categories'])
  })
})
