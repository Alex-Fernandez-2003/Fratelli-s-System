import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HistoryPage } from './HistoryPage'
import {
  createProductionHistoryFilters,
  fetchProductionHistory,
  fetchProductionSummary,
} from './api'

const updateFilters = vi.fn()
const setPage = vi.fn()
const clearFilters = vi.fn()
const navigate = vi.fn()
const useProductionSummary = vi.hoisted(() => vi.fn())
const httpGet = vi.hoisted(() => vi.fn())
let roles = ['ENCARGADO']
let historyQuery = {
  data: {
    items: [
      {
        id: 'production-1',
        batchCode: 'LOT-2026-001',
        status: 'COMPLETED',
        productId: 'prep-1',
        productName: 'Salsa de tomate',
        quantityProduced: 10,
        unitId: 'unit-1',
        unitSymbol: 'L',
        producedAt: '2026-09-01T14:30:00Z',
        createdByUserId: 'user-1',
        responsibleName: 'Ana',
        notes: null,
      },
    ],
    page: 2,
    pageSize: 25,
    totalCount: 26,
    totalPages: 2,
  },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({ user: { roles } }),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})
vi.mock('../../lib/api/http-client', () => ({ httpClient: { get: httpGet } }))
vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api')
  return {
    ...actual,
    useProductionHistoryFilterState: () => ({
      filters: {
        from: '2026-09-01',
        to: '2026-09-30',
        page: 2,
        pageSize: 25,
        productId: undefined,
        batchCode: undefined,
        responsible: undefined,
      },
      updateFilters,
      setPage,
      clearFilters,
    }),
    useProductionHistory: () => historyQuery,
    useProductionPreparations: () => ({
      data: { items: [{ id: 'prep-1', name: 'Salsa de tomate' }] },
    }),
    useProductionSummary: useProductionSummary,
    useProductionDetail: () => ({
      data: {
        id: 'production-1',
        batchCode: 'LOT-2026-001',
        status: 'COMPLETED',
        productId: 'prep-1',
        productName: 'Salsa de tomate',
        quantityProduced: 10,
        unitId: 'unit-1',
        unitSymbol: 'L',
        producedAt: '2026-09-01T14:30:00Z',
        createdByUserId: 'user-1',
        responsibleName: 'Ana',
        notes: null,
        consumptions: [
          {
            productId: 'ingredient-1',
            productName: 'Tomate',
            quantityConsumed: 3,
            unitId: 'kg',
            unitSymbol: 'kg',
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }),
  }
})

const summary = {
  data: {
    productionCount: 4,
    latestProduction: {
      productionId: 'production-1',
      batchCode: 'LOT-2026-001',
      productId: 'prep-1',
      productName: 'Salsa de tomate',
      producedAt: '2026-09-01T14:30:00Z',
    },
    mostProducedPreparation: {
      productId: 'prep-1',
      productName: 'Salsa de tomate',
      productionCount: 3,
    },
  },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}

function renderPage(summaryValue = summary) {
  useProductionSummary.mockReturnValue(summaryValue)
  return render(
    <MemoryRouter>
      <HistoryPage />
    </MemoryRouter>,
  )
}

describe('Production History', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    httpGet.mockResolvedValue({})
    roles = ['ENCARGADO']
    historyQuery = { ...historyQuery, error: null }
  })
  afterEach(cleanup)

  it('uses the business-time current month and sends history pagination plus summary filters independently', async () => {
    const filters = createProductionHistoryFilters(new Date('2026-08-31T02:30:00.000Z'))
    expect(filters).toMatchObject({ from: '2026-08-01', to: '2026-08-30', page: 1 })

    await fetchProductionHistory({
      ...filters,
      page: 2,
      productId: 'prep-1',
      batchCode: 'LOT-1',
      responsible: ' Ana ',
    })
    expect(httpGet).toHaveBeenLastCalledWith(
      '/api/v1/productions?page=2&pageSize=25&productId=prep-1&batchCode=LOT-1&responsible=Ana&from=2026-08-01&to=2026-08-30',
    )
    await fetchProductionSummary({
      productId: 'prep-1',
      batchCode: 'LOT-1',
      responsible: ' Ana ',
      from: filters.from,
      to: filters.to,
    })
    expect(httpGet).toHaveBeenLastCalledWith(
      '/api/v1/productions/summary?productId=prep-1&batchCode=LOT-1&responsible=Ana&from=2026-08-01&to=2026-08-30',
    )
  })

  it('renders exactly three server-backed summary cards and real batch data responsively', () => {
    renderPage()

    expect(screen.getByText('Producciones registradas')).toBeInTheDocument()
    expect(screen.getByText('Última producción')).toBeInTheDocument()
    expect(screen.getByText('Preparación más producida')).toBeInTheDocument()
    expect(screen.getAllByText('LOT-2026-001').length).toBeGreaterThan(0)
    expect(screen.getByText('3 eventos')).toBeInTheDocument()
    expect(screen.queryByText(/total físico/i)).not.toBeInTheDocument()
  })

  it('passes all non-pagination filters to summary and resets history pagination on filter changes', () => {
    renderPage()

    expect(useProductionSummary).toHaveBeenCalledWith({
      from: '2026-09-01',
      to: '2026-09-30',
      productId: undefined,
      batchCode: undefined,
      responsible: undefined,
    })
    fireEvent.change(screen.getByLabelText('Responsable'), { target: { value: ' Ana ' } })
    fireEvent.change(screen.getByLabelText('Código de lote'), { target: { value: 'LOT-2' } })
    expect(
      screen.getByRole('button', { name: 'Página anterior del historial de producción' }),
    ).toHaveClass('min-h-11')
    fireEvent.click(
      screen.getByRole('button', { name: 'Página anterior del historial de producción' }),
    )

    expect(updateFilters).toHaveBeenCalledWith({ responsible: ' Ana ' })
    expect(updateFilters).toHaveBeenCalledWith({ batchCode: 'LOT-2' })
    expect(setPage).toHaveBeenCalledWith(1)
  })

  it('keeps history visible when the independent summary query fails', () => {
    renderPage({ ...summary, error: new Error('offline') })

    expect(screen.getAllByText('Salsa de tomate').length).toBeGreaterThan(0)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el resumen')
  })

  it('shows the register CTA to writers but not to a pure CONTADORA', () => {
    const view = renderPage()
    expect(screen.getByRole('button', { name: 'Registrar producción' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Registrar producción' }))
    expect(navigate).toHaveBeenCalledWith('/produccion/registrar')

    view.unmount()
    roles = ['CONTADORA']
    renderPage()
    expect(screen.queryByRole('button', { name: 'Registrar producción' })).not.toBeInTheDocument()
  })

  it('loads the selected production detail and its persisted consumptions on demand', () => {
    renderPage()
    fireEvent.click(screen.getAllByRole('button', { name: 'Ver detalle de LOT-2026-001' })[0])

    const dialog = screen.getByRole('dialog', { name: 'Detalle de producción' })
    expect(within(dialog).getByText('Consumo registrado')).toBeInTheDocument()
    expect(within(dialog).getByText('Ingredientes consumidos')).toBeInTheDocument()
    expect(within(dialog).getByText('Tomate')).toBeInTheDocument()
    expect(within(dialog).getByText('3 kg')).toBeInTheDocument()
  })
})
