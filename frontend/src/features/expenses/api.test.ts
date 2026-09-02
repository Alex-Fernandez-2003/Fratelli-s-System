import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }))
vi.mock('@/lib/api/http-client', () => ({ httpClient: { get, post } }))

import {
  EXPENSE_HISTORY_READ_ROLES,
  EXPENSE_WRITE_ROLES,
  createExpenseHistoryFilters,
  expenseCanWrite,
  expenseHistoryKeys,
  expenseKeys,
  expensesApi,
  fetchExpenseHistory,
  setExpenseHistoryPage,
  useExpenseHistoryFilterState,
  updateExpenseHistoryFilters,
} from './api'
import { authenticatedNavigation, visibleNavigation } from '../navigation'

describe('expenses API adapter', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.useRealTimers())

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
    expect(expenseHistoryKeys.all).toEqual(['expenses'])
  })

  it('uses the America/La_Paz current month and sends only approved history filters', async () => {
    const initial = createExpenseHistoryFilters(new Date('2026-08-31T02:30:00.000Z'))
    expect(initial).toMatchObject({ from: '2026-08-01', to: '2026-08-30', page: 1, pageSize: 25 })

    get.mockResolvedValueOnce({ items: [] })
    await fetchExpenseHistory({
      ...initial,
      page: 2,
      categoryId: 'category-1',
      cashSource: 'CASH_DRAWER',
      shiftType: 'NIGHT',
      responsible: ' Ana ',
    })
    expect(get).toHaveBeenCalledWith(
      '/api/v1/expenses?page=2&pageSize=25&from=2026-08-01&to=2026-08-30&categoryId=category-1&cashSource=CASH_DRAWER&responsible=Ana&shiftType=NIGHT',
    )
  })

  it('restores current-month defaults when history filters are cleared', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-31T02:30:00.000Z'))
    const { result } = renderHook(() =>
      useExpenseHistoryFilterState(new Date('2026-07-01T12:00:00.000Z')),
    )

    act(() => result.current.clearFilters())

    expect(result.current.filters).toMatchObject({
      from: '2026-08-01',
      to: '2026-08-30',
      page: 1,
      pageSize: 25,
    })
  })

  it('omits empty values and keeps filter changes on page one', async () => {
    const initial = createExpenseHistoryFilters(new Date('2026-08-31T02:30:00.000Z'))
    const changed = updateExpenseHistoryFilters(initial, {
      responsible: '   ',
      cashSource: undefined,
    })
    expect(changed).toMatchObject({ page: 1, responsible: '   ', cashSource: undefined })
    expect(setExpenseHistoryPage(changed, 3).page).toBe(3)

    get.mockResolvedValueOnce({ items: [] })
    await fetchExpenseHistory(changed)
    expect(get).toHaveBeenCalledWith(
      '/api/v1/expenses?page=1&pageSize=25&from=2026-08-01&to=2026-08-30',
    )
    expect(get.mock.lastCall?.[0]).not.toContain('shiftId')
  })

  it('keeps expense history readable for CONTADORA while register remains writer-only', () => {
    const gastos = authenticatedNavigation.find((item) => item.id === 'gastos')!
    expect(gastos.readRoles).toEqual(EXPENSE_HISTORY_READ_ROLES)
    expect(typeof gastos.target === 'function' && gastos.target(['CONTADORA'])).toBe(
      '/gastos/historial',
    )
    expect(typeof gastos.target === 'function' && gastos.target(['CONTADORA', 'ENCARGADO'])).toBe(
      '/gastos',
    )
    expect(visibleNavigation(['CONTADORA']).map((item) => item.id)).toContain('gastos')
    expect(visibleNavigation(['EMPLEADO']).map((item) => item.id)).not.toContain('gastos')
    expect(expenseCanWrite(['CONTADORA'])).toBe(false)
    expect(expenseCanWrite(['CONTADORA', 'ENCARGADO'])).toBe(true)
    expect(EXPENSE_WRITE_ROLES).toEqual(['ADMINISTRADOR', 'ENCARGADO'])
  })
})
