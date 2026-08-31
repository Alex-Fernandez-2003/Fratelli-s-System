import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '@/lib/api/http-client'
import { NewOrderPage, OrderDetailPage } from './pages'

const {
  createMutate,
  useCreateOrder,
  useOrder,
  useOrders,
  useAssignOrder,
  useCancelOrder,
  useDeliverOrder,
  useTakeOrder,
} = vi.hoisted(() => ({
  createMutate: vi.fn(),
  useCreateOrder: vi.fn(),
  useOrder: vi.fn(),
  useOrders: vi.fn(),
  useAssignOrder: vi.fn(),
  useCancelOrder: vi.fn(),
  useDeliverOrder: vi.fn(),
  useTakeOrder: vi.fn(),
}))
vi.mock('./api', () => ({
  useCreateOrder,
  useOrder,
  useOrders,
  useAssignOrder,
  useCancelOrder,
  useDeliverOrder,
  useTakeOrder,
}))
vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { roles: ['MESERO'] } }),
}))
vi.mock('@/features/kitchen/realtime', () => ({ useKitchenConnectionStatus: () => 'connected' }))
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      items: [{ id: 'product-1', name: 'Pizza', isActive: true, isSellable: true, salePrice: 20 }],
    },
  }),
}))

function Location() {
  return <p data-testid="location">{useLocation().pathname}</p>
}

describe('OrderDetailPage HU-012 sale entry point', () => {
  beforeEach(() => {
    useOrder.mockReset()
    useAssignOrder.mockReturnValue({ mutate: vi.fn(), isPending: false })
    useCancelOrder.mockReturnValue({ mutate: vi.fn(), isPending: false })
    useDeliverOrder.mockReturnValue({ mutate: vi.fn(), isPending: false })
    useOrder.mockReturnValue({
      data: {
        id: 'order-12345678',
        status: 'ENTREGADO',
        total: 25,
        items: [],
      },
      isLoading: false,
      isError: false,
    })
  })

  it.each(['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'CANCELADO'])(
    'shows Confirmar venta only for ENTREGADO, never %s',
    (status) => {
      useOrder.mockReturnValue({
        data: { id: 'order-12345678', status, total: 25, items: [] },
        isLoading: false,
        isError: false,
      })
      const { unmount } = render(
        <MemoryRouter initialEntries={['/pedidos/order-12345678']}>
          <OrderDetailPage />
        </MemoryRouter>,
      )
      expect(screen.queryByRole('link', { name: 'Confirmar venta' })).not.toBeInTheDocument()
      unmount()
    },
  )

  it('uses the actual delivered order id in the checkout navigation target', () => {
    render(
      <MemoryRouter initialEntries={['/pedidos/order-12345678']}>
        <OrderDetailPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Confirmar venta' })).toHaveAttribute(
      'href',
      '/pedidos/order-12345678/cobrar',
    )
  })
})

describe('NewOrderPage HU-013', () => {
  beforeEach(() => {
    createMutate.mockReset()
    useCreateOrder.mockReturnValue({ mutate: createMutate, isPending: false })
  })

  it('uses the structured shortage, preserves the draft on Volver, and retries the same draft with acknowledgement', async () => {
    render(
      <MemoryRouter initialEntries={['/pedidos/nuevo']}>
        <NewOrderPage />
        <Location />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Mesa o referencia' }), {
      target: { value: 'M-7' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'Notas generales' }), {
      target: { value: 'sin cebolla' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Crear pedido' }))
    const [firstRequest, firstOptions] = createMutate.mock.calls[0]
    expect(firstRequest).toMatchObject({
      tableReference: 'M-7',
      notes: 'sin cebolla',
      acknowledgeStockShortage: false,
    })
    await act(async () =>
      firstOptions.onError(
        new HttpError(409, {
          code: 'ORDER_STOCK_ACKNOWLEDGEMENT_REQUIRED',
          shortages: [
            { productName: 'Masa', shortageQuantity: 2, inventoryUnitSymbol: 'kg' },
            { productName: 'Queso', shortageQuantity: 1, inventoryUnitSymbol: 'kg' },
          ],
        }),
      ),
    )
    expect(screen.getByRole('dialog', { name: 'Stock insuficiente' })).toHaveTextContent(
      'Masa: Faltante 2 kg',
    )
    expect(screen.getByRole('dialog')).toHaveTextContent('Queso: Faltante 1 kg')
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(createMutate).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('textbox', { name: 'Mesa o referencia' })).toHaveValue('M-7')
    expect(screen.getByRole('textbox', { name: 'Notas generales' })).toHaveValue('sin cebolla')
    fireEvent.click(screen.getByRole('button', { name: 'Crear pedido' }))
    const retryOptions = createMutate.mock.calls[1][1]
    await act(async () =>
      retryOptions.onError(
        new HttpError(409, {
          code: 'ORDER_STOCK_ACKNOWLEDGEMENT_REQUIRED',
          shortages: [{ productName: 'Masa', shortageQuantity: 3, inventoryUnitSymbol: 'kg' }],
        }),
      ),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    const [retry] = createMutate.mock.calls[2]
    expect(retry).toEqual({ ...firstRequest, acknowledgeStockShortage: true })
  })
})
