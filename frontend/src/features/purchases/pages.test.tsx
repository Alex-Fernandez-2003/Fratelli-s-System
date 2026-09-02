import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PurchasesPage } from './pages'

const navigate = vi.hoisted(() => vi.fn())
const usePurchasesList = vi.hoisted(() => vi.fn())
const usePurchaseDetail = vi.hoisted(() => vi.fn())
const roles = vi.hoisted(() => ({ value: ['ENCARGADO'] as string[] }))
const purchaseId = '123e4567-e89b-12d3-a456-426614174000'
const purchase = {
  id: purchaseId,
  purchaseDate: '2026-08-20',
  supplierId: 'supplier-1',
  supplierName: 'Proveedor real',
  purchaseArea: 'GENERAL',
  status: 'PENDIENTE' as const,
  total: 120,
  createdByUserId: 'creator-1',
  responsibleName: 'Ana',
  cancellationReason: null,
  cancelledAt: null,
  cancelledByUserId: null,
}

vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { roles: roles.value },
    hasAnyRole: (allowed: string[]) => allowed.some((role) => roles.value.includes(role)),
  }),
}))
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})
vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api')
  return {
    ...actual,
    usePurchasesList,
    usePurchaseDetail,
    usePurchaseOperationDetail: () => ({ data: undefined, isLoading: false, error: null }),
    useSuppliersForPurchase: () => ({
      data: { items: [{ id: 'supplier-1', name: 'Proveedor real' }] },
    }),
    useCancelPurchase: () => ({ isPending: false, mutateAsync: vi.fn() }),
    useCreatePurchase: () => ({ isPending: false, mutateAsync: vi.fn() }),
    useReceivePurchase: () => ({ isPending: false, mutateAsync: vi.fn() }),
    useProductsForPurchase: () => ({ data: { items: [] } }),
    useUnitsForPurchase: () => ({ data: { items: [] } }),
  }
})

const renderPage = () =>
  render(
    <MemoryRouter>
      <PurchasesPage />
    </MemoryRouter>,
  )

describe('Purchases history page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    roles.value = ['ENCARGADO']
    usePurchasesList.mockReturnValue({
      data: { items: [purchase], totalCount: 1, totalPages: 1 },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
    usePurchaseDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('keeps CONTADORA read-only while allowing list/detail access', () => {
    roles.value = ['CONTADORA']
    renderPage()
    expect(screen.getAllByText('Proveedor real').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Ver detalle/ }).length).toBeGreaterThan(0)
    expect(screen.queryByText('Nueva compra')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Página anterior del historial de compras' }),
    ).toHaveClass('min-h-11')
    expect(
      screen.getByRole('button', { name: 'Página siguiente del historial de compras' }),
    ).toHaveClass('min-h-11')
    expect(screen.queryByRole('button', { name: /Recibir compra/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Confirmar cancelación')).not.toBeInTheDocument()
  })

  it('forces pure COCINA to COCINA and does not offer General or Todas', () => {
    roles.value = ['COCINA']
    renderPage()
    expect(usePurchasesList).toHaveBeenCalledWith(
      expect.objectContaining({ purchaseArea: 'KITCHEN' }),
    )
    expect(screen.queryByRole('option', { name: 'General' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Todas' })).not.toBeInTheDocument()
    expect(screen.getAllByRole('combobox').at(-1)).toHaveValue('KITCHEN')
  })

  it('restores the last-30-days default range when filters are cleared', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-31T02:30:00.000Z'))
    renderPage()

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-07-01' } })
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2026-07-31' } })
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

    expect(screen.getByLabelText('Desde')).toHaveValue('2026-08-01')
    expect(screen.getByLabelText('Hasta')).toHaveValue('2026-08-30')
  })

  it('only exposes receive and cancel actions while a purchase is pending', () => {
    for (const status of ['PENDIENTE', 'RECIBIDA', 'CANCELADA'] as const) {
      cleanup()
      usePurchasesList.mockReturnValue({
        data: { items: [{ ...purchase, status }], totalCount: 1, totalPages: 1 },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      })
      renderPage()
      if (status === 'PENDIENTE') {
        expect(screen.getAllByRole('button', { name: /Recibir compra/ }).length).toBeGreaterThan(0)
        expect(screen.getAllByRole('button', { name: /Cancelar compra/ }).length).toBeGreaterThan(0)
      } else {
        expect(screen.queryByRole('button', { name: /Recibir compra/ })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /Cancelar compra/ })).not.toBeInTheDocument()
      }
    }
  })

  it('shows real receipt and cancellation fields only after on-demand detail selection', () => {
    usePurchaseDetail.mockReturnValue({
      data: {
        ...purchase,
        status: 'CANCELADA' as const,
        cancellationReason: 'Factura anulada',
        cancelledAt: '2026-08-21T15:00:00Z',
        cancelledByUserId: 'user-cancel',
        receiptReference: 'Factura 4',
        notes: 'Nota persistida',
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            productName: 'Arroz',
            orderedQuantity: 2,
            unitId: 'unit-1',
            unitSymbol: 'kg',
            unitCost: 10,
            lineTotal: 20,
          },
        ],
        receipt: {
          id: 'receipt-1',
          receivedAt: '2026-08-20T15:00:00Z',
          receivedByUserId: 'user-receive',
          responsibleName: 'Ana',
          notes: 'Recibido',
          lines: [
            { purchaseItemId: 'item-1', receivedQuantity: 2, unitId: 'unit-1', unitSymbol: 'kg' },
          ],
        },
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
    renderPage()
    expect(screen.queryByText('Recepción registrada')).not.toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: /Ver detalle/ })[0])
    expect(screen.getByText('Recepción registrada')).toBeInTheDocument()
    expect(screen.getByText('Cancelación registrada')).toBeInTheDocument()
    expect(screen.getByText(new RegExp(purchaseId))).toBeInTheDocument()
    expect(screen.getByText(/Factura anulada/)).toBeInTheDocument()
  })
})
