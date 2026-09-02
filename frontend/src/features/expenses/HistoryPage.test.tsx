import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HistoryPage } from './HistoryPage'

const updateFilters = vi.fn()
const setPage = vi.fn()
const clearFilters = vi.fn()
let roles = ['ENCARGADO']
let historyQuery = {
  data: {
    items: [
      {
        id: 'expense-1',
        expenseDate: '2026-09-01',
        businessDate: '2026-09-01',
        description: 'Compra de limpieza',
        expenseCategoryId: null,
        expenseCategoryName: null,
        cashSource: 'CASH_DRAWER' as const,
        amount: 12.5,
        createdByUserId: 'user-1',
        responsibleDisplayName: 'Ana',
        shiftId: null,
        shiftType: 'MORNING' as const,
      },
    ],
    page: 2,
    pageSize: 25,
    totalCount: 26,
    totalPages: 2,
    totalAmount: 99.75,
    cashDrawerTotal: 80.25,
    pettyCashTotal: 19.5,
  },
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
}

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: { roles } }),
}))
vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api')
  return {
    ...actual,
    useExpenseHistoryFilterState: () => ({
      filters: {
        from: '2026-09-01',
        to: '2026-09-30',
        page: 2,
        pageSize: 25,
        categoryId: undefined,
        cashSource: undefined,
        responsible: undefined,
        shiftType: undefined,
      },
      updateFilters,
      setPage,
      clearFilters,
    }),
    useExpenseHistory: () => historyQuery,
    useExpenseCategories: () => ({
      data: [{ id: 'category-1', name: 'Limpieza' }],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }),
  }
})

function renderPage() {
  return render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>,
  )
}

describe('Expense history', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-30T16:00:00.000Z'))
    vi.clearAllMocks()
    roles = ['ENCARGADO']
    historyQuery = { ...historyQuery, isError: false, error: null }
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('renders server totals, null categories, and responsive history data without deriving totals from rows', () => {
    renderPage()

    expect(screen.getByTestId('expense-total-amount')).toHaveTextContent('Bs. 99.75')
    expect(screen.getByTestId('expense-cash-drawer-total')).toHaveTextContent('Bs. 80.25')
    expect(screen.getByTestId('expense-petty-cash-total')).toHaveTextContent('Bs. 19.50')
    expect(screen.getAllByText('Sin categoría').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Compra de limpieza').length).toBeGreaterThan(0)
    expect(screen.getByText('Mostrando 26–26 de 26')).toBeInTheDocument()
  })

  it('offers only approved filters, resets pagination for filters, and navigates pages server-side', () => {
    renderPage()

    expect(screen.queryByLabelText(/shift id/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/descripci.n.*buscar/i)).not.toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Categoría'), { target: { value: 'category-1' } })
    fireEvent.change(screen.getByLabelText('Responsable'), { target: { value: ' Ana ' } })
    expect(
      screen.getByRole('button', { name: 'Página anterior del historial de gastos' }),
    ).toHaveClass('min-h-11')
    fireEvent.click(screen.getByRole('button', { name: 'Página anterior del historial de gastos' }))

    expect(updateFilters).toHaveBeenCalledWith({ categoryId: 'category-1' })
    expect(updateFilters).toHaveBeenCalledWith({ responsible: ' Ana ' })
    expect(setPage).toHaveBeenCalledWith(1)
  })

  it('keeps CONTADORA read-only with only the history tab', () => {
    roles = ['CONTADORA']
    renderPage()

    expect(screen.getByRole('link', { name: 'Historial' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Registrar gasto' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /registrar gasto/i })).not.toBeInTheDocument()
  })

  it('distinguishes filtered empty states and permits retry after a history failure', () => {
    historyQuery = {
      ...historyQuery,
      data: { ...historyQuery.data, items: [], totalCount: 0 },
      isError: true,
      error: new Error('offline'),
    }
    const view = renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el historial de gastos.')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(historyQuery.refetch).toHaveBeenCalled()

    view.unmount()
    historyQuery = {
      ...historyQuery,
      data: { ...historyQuery.data, items: [], totalCount: 0 },
      isError: false,
      error: null,
    }
    renderPage()
    expect(screen.getByText('No hay gastos registrados para este período.')).toBeInTheDocument()
  })
})
