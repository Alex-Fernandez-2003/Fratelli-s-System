import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SalesHistoryPage } from './SalesHistoryPage'

const sale = {
  id: 'sale-real-1',
  confirmedAt: '2026-09-01T14:30:00Z',
  businessDate: '2026-09-01',
  shiftId: 'shift-1',
  shiftType: 'MORNING',
  salesChannel: 'PEDIDOSYA',
  paymentMethod: 'CASH',
  subtotal: 42.5,
  total: 42.5,
  confirmedByUserId: 'user-1',
  responsibleName: 'María',
  customerId: null,
  customerNameSnapshot: null,
  customerCiSnapshot: null,
  customerNitSnapshot: null,
}
const query = {
  data: { items: [sale], page: 2, pageSize: 25, totalCount: 26, totalPages: 2 },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}
const updateFilters = vi.fn()
const setPage = vi.fn()
let roles = ['ENCARGADO']

vi.mock('@/features/auth/AuthProvider', () => ({ useAuth: () => ({ user: { roles } }) }))
vi.mock('./api', () => ({
  useSalesHistoryFilterState: () => ({
    filters: { from: '2026-09-01', to: '2026-09-01', page: 2, pageSize: 25 },
    updateFilters,
    setPage,
  }),
  useSalesHistory: () => query,
  salesHistoryScope: (currentRoles: string[]) =>
    currentRoles.includes('ENCARGADO') ? 'broad' : 'assigned-shift',
  useSaleDetail: () => ({
    data: {
      ...sale,
      items: [],
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}))

describe('SalesHistoryPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    roles = ['ENCARGADO']
  })

  it('renders generated payment/channel labels, final consumer snapshots, and responsive list structures', () => {
    render(<SalesHistoryPage />)

    expect(screen.getAllByText('Efectivo')).toHaveLength(2)
    expect(screen.getAllByText('PedidosYa')).toHaveLength(2)
    expect(screen.getAllByText('Consumidor final')).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Ver detalle de sale-real-1' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: /nueva venta/i })).not.toBeInTheDocument()
  })

  it('opens the on-demand detail overlay for the selected real sale ID', () => {
    render(<SalesHistoryPage />)

    fireEvent.click(screen.getAllByRole('button', { name: 'Ver detalle de sale-real-1' })[0])

    const detail = screen.getByRole('dialog', { name: 'Detalle de venta' })
    expect(detail).toBeInTheDocument()
    expect(within(detail).getByText('ID: sale-real-1')).toBeInTheDocument()
  })

  it('renders other generated enum labels and an immutable customer snapshot', () => {
    query.data = {
      ...query.data,
      items: [
        {
          ...sale,
          salesChannel: 'DIRECT',
          paymentMethod: 'EXTERNAL',
          customerNameSnapshot: 'Ana histórica',
        },
      ],
    }
    render(<SalesHistoryPage />)

    expect(screen.getAllByText('Pago externo')).toHaveLength(2)
    expect(screen.getAllByText('Directo')).toHaveLength(2)
    expect(screen.getAllByText('Ana histórica')).toHaveLength(2)
    query.data = { items: [sale], page: 2, pageSize: 25, totalCount: 26, totalPages: 2 }
  })

  it('maps filters and server pagination without a broad shift control for MESERO-only users', () => {
    roles = ['MESERO']
    render(<SalesHistoryPage />)

    fireEvent.change(screen.getByLabelText('Buscar cliente'), { target: { value: 'Ana' } })
    fireEvent.change(screen.getByLabelText('Método de pago'), { target: { value: 'QR' } })
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))

    expect(updateFilters).toHaveBeenCalledWith({ customerSearch: 'Ana' })
    expect(updateFilters).toHaveBeenCalledWith({ paymentMethod: 'QR' })
    expect(setPage).toHaveBeenCalledWith(1)
    expect(screen.queryByLabelText('Turno')).not.toBeInTheDocument()
    expect(screen.getByText('Mostrando 26–26 de 26')).toBeInTheDocument()
  })

  it('shows the broad shift control for a multi-role user and a retryable error state', () => {
    roles = ['MESERO', 'ENCARGADO']
    const view = render(<SalesHistoryPage />)

    expect(screen.getByLabelText('Turno')).toBeInTheDocument()
    view.unmount()
    query.error = new Error('offline')
    render(<SalesHistoryPage />)

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el historial de ventas.')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(query.refetch).toHaveBeenCalledOnce()
    query.error = null
  })
})
