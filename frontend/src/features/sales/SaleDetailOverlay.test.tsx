import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '@/lib/api/http-client'
import { SaleDetailOverlay } from './SaleDetailOverlay'

const detail = {
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
  responsibleName: 'María histórica',
  customerId: 'customer-current-id',
  customerNameSnapshot: 'Ana histórica',
  customerCiSnapshot: '123',
  customerNitSnapshot: null,
  items: [
    { productId: 'product-1', productName: 'Pizza', quantity: 2, unitPrice: 20, lineTotal: 40 },
    {
      productId: 'product-2',
      productName: 'Refresco',
      quantity: 1,
      unitPrice: 2.5,
      lineTotal: 2.5,
    },
  ],
}

const query = { data: detail, isLoading: false, error: null as Error | null, refetch: vi.fn() }
vi.mock('./api', () => ({ useSaleDetail: () => query }))
vi.mock('./saleReceiptPdf', () => ({ generateSaleReceiptPdf: vi.fn() }))

describe('SaleDetailOverlay', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
    query.data = detail
    query.error = null
  })

  it('renders immutable sale snapshots, contractual item totals, and no fiscal or invented fields', () => {
    render(<SaleDetailOverlay saleId="sale-real-1" onClose={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: 'Detalle de venta' })).toBeInTheDocument()
    expect(screen.getByText('Ana histórica')).toBeInTheDocument()
    expect(screen.getByText('CI: 123')).toBeInTheDocument()
    expect(screen.queryByText(/NIT:/)).not.toBeInTheDocument()
    expect(screen.getByText(/Responsable: María histórica/)).toBeInTheDocument()
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    expect(screen.getByText(/2 × Bs\s?20,00/)).toBeInTheDocument()
    expect(screen.getByText('Total pagado')).toBeInTheDocument()
    expect(screen.getByText(/Bs\s?42,50/)).toBeInTheDocument()
    expect(screen.queryByText(/IVA|descuento|reimprimir|factura/i)).not.toBeInTheDocument()
  })

  it('downloads a client-side internal receipt from the loaded historical detail', async () => {
    const receiptAdapter = await import('./saleReceiptPdf')
    render(<SaleDetailOverlay saleId="sale-real-1" onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Descargar comprobante PDF' }))

    expect(receiptAdapter.generateSaleReceiptPdf).toHaveBeenCalledWith(detail)
  })

  it('shows recoverable feedback when client-side receipt generation fails', async () => {
    const receiptAdapter = await import('./saleReceiptPdf')
    vi.mocked(receiptAdapter.generateSaleReceiptPdf).mockImplementationOnce(() => {
      throw new Error('PDF runtime failure')
    })
    render(<SaleDetailOverlay saleId="sale-real-1" onClose={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Descargar comprobante PDF' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo generar el comprobante PDF. Intentá nuevamente.',
    )
  })

  it('uses Consumidor final for a null snapshot and closes through the primitive keyboard control', () => {
    query.data = {
      ...detail,
      customerId: null,
      customerNameSnapshot: null,
      customerCiSnapshot: null,
    }
    const onClose = vi.fn()
    render(<SaleDetailOverlay saleId="sale-real-1" onClose={onClose} />)

    expect(screen.getByText('Consumidor final')).toBeInTheDocument()
    expect(screen.queryByText(/CI:/)).not.toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Detalle de venta' }), { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('shows a loading status while the selected detail is requested', () => {
    query.data = undefined as never
    query.error = null
    query.isLoading = true
    render(<SaleDetailOverlay saleId="sale-real-1" onClose={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando detalle de venta…')
    query.isLoading = false
  })

  it('keeps the overlay recoverable when a stale sale detail returns 404', () => {
    query.data = undefined as never
    query.error = new HttpError(404, { title: 'Not found' })
    render(<SaleDetailOverlay saleId="sale-real-1" onClose={vi.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent('La venta ya no está disponible.')
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeEnabled()
    expect(query.refetch).not.toHaveBeenCalled()
  })
})
