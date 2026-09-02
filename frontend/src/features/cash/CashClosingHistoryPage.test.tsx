import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { businessDate } from '@/lib/business-time'
import type { CashClosingDto } from './api'
import { CashClosingHistoryPage } from './CashClosingHistoryPage'

const closing: CashClosingDto = {
  id: '00000000-0000-0000-0000-000000000001',
  cashSessionId: '00000000-0000-0000-0000-000000000011',
  businessDate: '2026-02-01',
  openingAmount: 500,
  pettyCashOpeningAmount: 200,
  cashRemovedAmount: 50,
  salesTotal: 1200,
  cashSalesTotal: 800,
  qrSalesTotal: 200,
  externalSalesTotal: 200,
  directSalesTotal: 900,
  pedidosYaSalesTotal: 300,
  cashDrawerExpensesTotal: 80,
  pettyCashExpensesTotal: 20,
  expensesTotal: 100,
  expectedCash: 1550,
  declaredCash: 1560,
  difference: 10,
  observation: null,
  closedByUserId: '00000000-0000-0000-0000-000000000010',
  closedAt: '2026-02-01T22:00:00.000Z',
}

const page = {
  items: [closing],
  page: 1,
  pageSize: 25,
  totalCount: 26,
  totalPages: 2,
}

let observedFilters: Array<Record<string, unknown>> = []
let observedDetailIds: Array<string | undefined> = []
let historyState: {
  data?: typeof page
  isLoading?: boolean
  isFetching?: boolean
  isError?: boolean
  error?: unknown
  refetch: ReturnType<typeof vi.fn>
} = { data: page, refetch: vi.fn() }
let detailState: { data?: CashClosingDto; isLoading?: boolean; error?: unknown } = {}

vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api')
  return {
    ...actual,
    useCashClosingHistory: (filters: Record<string, unknown>) => {
      observedFilters.push(filters)
      return {
        data: historyState.data,
        isLoading: historyState.isLoading ?? false,
        isFetching: historyState.isFetching ?? false,
        isError: historyState.isError ?? Boolean(historyState.error),
        error: historyState.error,
        refetch: historyState.refetch,
      }
    },
    useCashClosingDetail: (id: string | undefined) => {
      observedDetailIds.push(id)
      return {
        data: detailState.data,
        isLoading: detailState.isLoading ?? false,
        error: detailState.error,
      }
    },
  }
})

function renderPage() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <CashClosingHistoryPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CashClosingHistoryPage HU-028', () => {
  beforeEach(() => {
    observedFilters = []
    observedDetailIds = []
    historyState = { data: page, refetch: vi.fn() }
    detailState = {}
  })

  it('defaults the period to the current business month using date-only values', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T01:00:00.000Z'))
    renderPage()
    const today = businessDate(new Date())
    expect(screen.getByLabelText('Desde')).toHaveValue(`${today.slice(0, 7)}-01`)
    expect(screen.getByLabelText('Hasta')).toHaveValue(today)
    vi.useRealTimers()
  })

  it('forwards date changes through the query state and resets pagination to page one', () => {
    renderPage()
    fireEvent.click(
      screen.getByRole('button', { name: 'Página siguiente del historial de cierres' }),
    )
    expect(observedFilters.at(-1)).toMatchObject({ page: 2 })

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-01-01' } })
    expect(observedFilters.at(-1)).toMatchObject({ from: '2026-01-01', page: 1 })

    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    expect(observedFilters.at(-1)).toMatchObject({ page: 1 })
    expect(observedFilters.at(-1)?.from).not.toBe('2026-01-01')
  })

  it('renders compact reconciliation columns and an equivalent mobile card without mutations or exports', () => {
    renderPage()
    expect(screen.getByText('Fecha de negocio')).toBeInTheDocument()
    expect(screen.getByText('Esperado')).toBeInTheDocument()
    expect(screen.getByText('Declarado')).toBeInTheDocument()
    expect(screen.getAllByText(/Sobrante/).length).toBeGreaterThan(0)
    expect(screen.getByTestId('cash-closing-mobile')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Editar|Eliminar|Reabrir|Corregir|Aprobar/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/Exportar|Descargar|Imprimir/i)).not.toBeInTheDocument()
  })

  it('opens persisted detail on demand and keeps detail cache selection by id', () => {
    renderPage()
    expect(observedDetailIds).toContain(undefined)
    expect(screen.queryByText('Detalle de cierre')).not.toBeInTheDocument()

    detailState = { data: closing }
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Ver detalle de cierre del 2026-02-01' })[0],
    )
    expect(observedDetailIds).toContain(closing.id)
    expect(screen.getByText('Detalle de cierre')).toBeInTheDocument()
    expect(screen.getByText('Apertura caja principal')).toBeInTheDocument()
    expect(screen.getByText('Apertura caja chica')).toBeInTheDocument()
    expect(screen.getByText('Medios de pago')).toBeInTheDocument()
    expect(screen.getByText('Canales')).toBeInTheDocument()
    expect(screen.queryByText('Ped...')).not.toBeInTheDocument()
  })

  it('distinguishes filtered empty, current-period empty, loading and retryable error states', () => {
    historyState = { data: { ...page, items: [], totalCount: 0, totalPages: 0 }, refetch: vi.fn() }
    const emptyView = renderPage()
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-01-01' } })
    expect(
      screen.getByText('No se encontraron cierres con los filtros aplicados.'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Limpiar filtros' }).at(-1)!)
    expect(
      screen.getByText('No hay cierres registrados en el período seleccionado.'),
    ).toBeInTheDocument()
    emptyView.unmount()

    historyState = { isLoading: true, data: undefined, refetch: vi.fn() }
    const loadingView = renderPage()
    expect(screen.getByRole('status')).toBeInTheDocument()
    loadingView.unmount()

    const refetch = vi.fn()
    historyState = { isError: true, error: new Error('backend'), refetch }
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(refetch).toHaveBeenCalled()
  })
})
