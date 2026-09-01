import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '@/lib/api/http-client'
import { CheckoutPage } from './pages'

const { saleMutate, createMutateAsync, useConfirmSale, useOrder, useCustomers, useCreateCustomer } =
  vi.hoisted(() => ({
    saleMutate: vi.fn(),
    createMutateAsync: vi.fn(),
    useConfirmSale: vi.fn(),
    useOrder: vi.fn(),
    useCustomers: vi.fn(),
    useCreateCustomer: vi.fn(),
  }))
vi.mock('./api', () => ({ useConfirmSale }))
vi.mock('@/features/orders/api', () => ({ useOrder }))
vi.mock('@/features/customers/api', () => ({ useCustomers, useCreateCustomer }))
vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { roles: ['MESERO'] } }),
}))
const order = {
  id: 'order-12345678',
  status: 'ENTREGADO',
  tableReference: 'Mesa 4',
  total: 25,
  items: [{ id: 'item-1', productName: 'Pizza', quantity: 1, lineTotal: 25 }],
}
function Location() {
  return <p data-testid="location">{useLocation().pathname}</p>
}
function renderCheckout() {
  return render(
    <MemoryRouter initialEntries={['/pedidos/order-12345678/cobrar']}>
      <CheckoutPage />
      <Location />
    </MemoryRouter>,
  )
}

describe('CheckoutPage HU-012', () => {
  beforeEach(() => {
    saleMutate.mockReset()
    useOrder.mockReturnValue({ data: order, isLoading: false, isError: false })
    useConfirmSale.mockReturnValue({ mutate: saleMutate, isPending: false })
    useCustomers.mockReturnValue({
      data: {
        items: [
          {
            id: 'customer-1',
            name: 'Ana Pérez',
            ci: '123',
            nit: null,
            notes: null,
            isActive: true,
          },
        ],
      },
      isLoading: false,
      refetch: vi.fn(),
    })
    createMutateAsync.mockResolvedValue({
      id: 'customer-new',
      name: 'Bea',
      ci: '456',
      nit: null,
      notes: null,
    })
    useCreateCustomer.mockReturnValue({ isPending: false, mutateAsync: createMutateAsync })
  })

  it('renders eligible real order data and only legal channel/payment fields without future scope controls', () => {
    renderCheckout()
    expect(screen.getByText('Estado: ENTREGADO')).toBeInTheDocument()
    expect(screen.getByText('Mesa / referencia: Mesa 4')).toBeInTheDocument()
    expect(screen.getByText(/Pizza/)).toBeInTheDocument()
    expect(screen.getByText('Consumidor final')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Cliente para la venta' })).toHaveValue('')
    expect(screen.queryByText(/NIT|Descuento|Caja 1/)).not.toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: 'Canal de venta' }), {
      target: { value: 'PEDIDOSYA' },
    })
    expect(screen.getByRole('combobox', { name: 'Método de pago' })).toHaveValue('EXTERNAL')
    expect(screen.queryByRole('option', { name: 'Efectivo' })).not.toBeInTheDocument()
  })

  it('does not mutate on cancel, uses selected legal values, handles only structured shortage fallback, and shows server sale values', async () => {
    const firstRender = renderCheckout()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar cobro' }))
    expect(saleMutate).not.toHaveBeenCalled()
    expect(screen.getByTestId('location')).toHaveTextContent('/pedidos/')
    // Remount after navigation for the confirmation paths.
    firstRender.unmount()
    renderCheckout()
    fireEvent.change(screen.getByRole('combobox', { name: 'Método de pago' }), {
      target: { value: 'QR' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar venta' }))
    const [request, options] = saleMutate.mock.calls[0]
    expect(request).toEqual({
      orderId: order.id,
      salesChannel: 'DIRECT',
      paymentMethod: 'QR',
      acknowledgeStockShortage: false,
      customerId: null,
    })
    await act(async () => options.onError(new HttpError(409, { code: 'SALE_ALREADY_CONFIRMED' })))
    expect(screen.queryByRole('dialog', { name: 'Stock insuficiente' })).not.toBeInTheDocument()
    await act(async () =>
      options.onError(
        new HttpError(409, {
          code: 'SALE_STOCK_CONFIRMATION_REQUIRED',
          shortages: [{ productName: 'Pizza', shortageQuantity: 1, inventoryUnitSymbol: 'u' }],
        }),
      ),
    )
    expect(screen.getByRole('dialog', { name: 'Stock insuficiente' })).toHaveTextContent(
      'Faltante 1 u',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(saleMutate.mock.calls[1][0]).toEqual({ ...request, acknowledgeStockShortage: true })
    await act(async () =>
      saleMutate.mock.calls[1][1].onSuccess({
        id: 'sale-12345678',
        total: 25,
        paymentMethod: 'QR',
        salesChannel: 'DIRECT',
        confirmedAt: '2026-08-30T12:00:00Z',
        confirmedByDisplayName: 'Ana',
      }),
    )
    expect(screen.getByRole('dialog', { name: 'Venta confirmada' })).toHaveTextContent(
      'Venta #SALE-123',
    )
    expect(screen.getByRole('dialog')).toHaveTextContent('La venta se registró correctamente.')
    expect(screen.queryByRole('button', { name: /Nueva venta/i })).not.toBeInTheDocument()
  })

  it('selects active customers, quick-creates by returned ID, and preserves the checkout selections on cancel', async () => {
    renderCheckout()
    fireEvent.change(screen.getByRole('combobox', { name: 'Cliente para la venta' }), {
      target: { value: 'customer-1' },
    })
    expect(screen.getByText('Cliente seleccionado: Ana Pérez')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: 'Canal de venta' }), {
      target: { value: 'PEDIDOSYA' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo cliente' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('combobox', { name: 'Cliente para la venta' })).toHaveValue(
      'customer-1',
    )
    expect(screen.getByRole('combobox', { name: 'Canal de venta' })).toHaveValue('PEDIDOSYA')
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo cliente' }))
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Bea' } })
    fireEvent.change(screen.getByLabelText(/^CI/), { target: { value: '456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cliente' }))
    expect(await screen.findByText('Cliente seleccionado: Bea')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar venta' }))
    expect(saleMutate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        customerId: 'customer-new',
        salesChannel: 'PEDIDOSYA',
        paymentMethod: 'EXTERNAL',
      }),
      expect.any(Object),
    )
  })

  it('searches active customers through the existing customer query before selection', () => {
    renderCheckout()
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar cliente' }), {
      target: { value: ' Ana ' },
    })
    expect(useCustomers).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 50,
      isActive: true,
      search: ' Ana ',
    })
  })

  it('does not silently fall back to consumidor final when the selected customer is concurrently inactivated', async () => {
    renderCheckout()
    fireEvent.change(screen.getByRole('combobox', { name: 'Cliente para la venta' }), {
      target: { value: 'customer-1' },
    })
    fireEvent.change(screen.getByRole('combobox', { name: 'Canal de venta' }), {
      target: { value: 'PEDIDOSYA' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar venta' }))
    await act(async () =>
      saleMutate.mock.calls[0][1].onError(new HttpError(409, { code: 'CUSTOMER_INACTIVE' })),
    )
    expect(screen.getByRole('alert')).toHaveTextContent(
      'El cliente seleccionado ya no está disponible.',
    )
    expect(screen.getByRole('combobox', { name: 'Cliente para la venta' })).toHaveValue('')
    expect(screen.getByRole('combobox', { name: 'Canal de venta' })).toHaveValue('PEDIDOSYA')
  })
})
