import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CashClosingPage } from './CashClosingPage'
import type { CashPreviewDto, CashClosingDto } from './api'
import { HttpError } from '@/lib/api/http-client'

const previewDto: CashPreviewDto = {
  cashSessionId: '00000000-0000-0000-0000-000000000001',
  businessDate: '2026-08-31',
  openingAmount: 500,
  pettyCashOpeningAmount: 200,
  cashRemovedAmount: 50,
  cashAmountCarriedForward: 100,
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
  shifts: [],
}

const closingDto: CashClosingDto = {
  id: '00000000-0000-0000-0000-000000000002',
  cashSessionId: previewDto.cashSessionId,
  businessDate: previewDto.businessDate,
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
  declaredCash: 1540,
  difference: -10,
  observation: 'Faltante por vuelto',
  closedByUserId: '00000000-0000-0000-0000-000000000010',
  closedAt: '2026-08-31T22:00:00.000Z',
}

let previewState: {
  data?: CashPreviewDto
  isLoading?: boolean
  isError?: boolean
  error?: unknown
  refetch?: ReturnType<typeof vi.fn>
} = {}

let closeMutateAsync: ReturnType<typeof vi.fn>
let closeState: { isPending: boolean; isError: boolean; error?: unknown } = {
  isPending: false,
  isError: false,
}

vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api')
  return {
    ...actual,
    useCashPreview: () => ({
      data: previewState.data,
      isLoading: previewState.isLoading ?? false,
      isError: previewState.isError ?? false,
      error: previewState.error,
      refetch: previewState.refetch ?? vi.fn(),
    }),
    useCloseCash: () => ({
      mutateAsync: closeMutateAsync,
      isPending: closeState.isPending,
      isError: closeState.isError,
      error: closeState.error,
    }),
  }
})

vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => ({
    user: { fullName: 'Ana López', username: 'ana.lopez', roles: ['ADMINISTRADOR'] },
  }),
}))

function renderPage() {
  const client = new QueryClient()
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <CashClosingPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CashClosingPage HU-026', () => {
  beforeEach(() => {
    previewState = { data: previewDto, isLoading: false, isError: false }
    closeMutateAsync = vi.fn().mockResolvedValue(closingDto)
    closeState = { isPending: false, isError: false }
  })

  it('shows loading state', () => {
    previewState = { isLoading: true, data: undefined }
    renderPage()
    expect(screen.getByText(/Cargando caja/i)).toBeInTheDocument()
  })

  it('renders 404 operational empty state, not zeroed form', () => {
    previewState = {
      isError: true,
      error: new HttpError(404, {}),
      data: undefined,
    }
    renderPage()
    expect(screen.getByText('No hay una caja abierta disponible para cerrar.')).toBeInTheDocument()
    expect(screen.queryByLabelText('Efectivo contado')).not.toBeInTheDocument()
  })

  it('shows recoverable error with retry', () => {
    const refetch = vi.fn()
    previewState = { isError: true, error: new HttpError(500, {}), refetch }
    renderPage()
    expect(screen.getByText(/No se pudo completar/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('renders preview with server-authoritative expectedCash and payment/channel separation', () => {
    renderPage()
    expect(screen.getByTestId('expected-cash')).toBeInTheDocument()
    expect(screen.getByText('Efectivo')).toBeInTheDocument()
    expect(screen.getByText('QR')).toBeInTheDocument()
    expect(screen.getByText('Externo')).toBeInTheDocument()
    expect(screen.getByText('Directo')).toBeInTheDocument()
    expect(screen.getByText('PedidosYa')).toBeInTheDocument()
    expect(screen.getByText('Efectivo arrastrado')).toBeInTheDocument()
  })

  it('carried forward hidden when null and still shows expectedCash unchanged', () => {
    previewState = {
      data: { ...previewDto, cashAmountCarriedForward: null },
    }
    renderPage()
    expect(screen.queryByText('Efectivo arrastrado')).not.toBeInTheDocument()
    expect(screen.getByTestId('expected-cash')).toHaveTextContent('Bs')
  })
})

describe('CashClosingPage HU-027', () => {
  beforeEach(() => {
    previewState = { data: previewDto, isLoading: false, isError: false }
    closeMutateAsync = vi.fn().mockResolvedValue(closingDto)
    closeState = { isPending: false, isError: false }
  })

  it('shows caja cuadrada when declared equals expected and observation optional', async () => {
    renderPage()
    const input = screen.getByLabelText('Efectivo contado')
    fireEvent.change(input, { target: { value: '1550' } })
    expect(screen.getByTestId('provisional-difference')).toHaveTextContent('Caja cuadrada')
    fireEvent.click(screen.getByRole('button', { name: 'Registrar cierre' }))
    expect(await screen.findByText('Confirmar cierre de caja')).toBeInTheDocument()
  })

  it('shows faltante for negative difference and requires observation', async () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Efectivo contado'), { target: { value: '1540' } })
    expect(screen.getByTestId('provisional-difference')).toHaveTextContent('Faltante')
    fireEvent.click(screen.getByRole('button', { name: 'Registrar cierre' }))
    expect(
      (await screen.findAllByText('La observación es obligatoria cuando hay diferencia.')).length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('Confirmar cierre de caja')).not.toBeInTheDocument()
  })

  it('shows sobrante for positive difference', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Efectivo contado'), { target: { value: '1560' } })
    expect(screen.getByTestId('provisional-difference')).toHaveTextContent('Sobrante')
  })

  it('whitespace observation invalid when required', async () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Efectivo contado'), { target: { value: '1560' } })
    fireEvent.change(screen.getByLabelText('Observación'), { target: { value: '   ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar cierre' }))
    expect(
      (await screen.findAllByText('La observación es obligatoria cuando hay diferencia.')).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('opens confirmation modal with responsible and posts only declaredCash+observation', async () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Efectivo contado'), { target: { value: '1540' } })
    fireEvent.change(screen.getByLabelText('Observación'), {
      target: { value: 'Faltante por vuelto' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar cierre' }))
    const dialog = await screen.findByText('Confirmar cierre de caja')
    expect(dialog).toBeInTheDocument()
    expect(screen.getAllByText('Ana López').length).toBeGreaterThanOrEqual(1)
    const confirmBtns = screen.getAllByRole('button', { name: 'Registrar cierre' })
    fireEvent.click(confirmBtns[confirmBtns.length - 1])
    await waitFor(() =>
      expect(closeMutateAsync).toHaveBeenCalledWith({
        declaredCash: 1540,
        observation: 'Faltante por vuelto',
      }),
    )
    const payload = closeMutateAsync.mock.calls[0][0]
    expect(payload).toEqual({ declaredCash: 1540, observation: 'Faltante por vuelto' })
    expect(payload).not.toHaveProperty('expectedCash')
  })

  it('disables confirm while pending to prevent double submit', () => {
    closeState = { isPending: true, isError: false }
    previewState = { data: previewDto }
    renderPage()
    fireEvent.change(screen.getByLabelText('Efectivo contado'), { target: { value: '1550' } })
    const candidates = screen.getAllByText('Registrar cierre')
    const btn = candidates[0].closest('button') ?? (candidates[0] as unknown as HTMLButtonElement)
    expect(btn.hasAttribute('disabled') || (btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('shows success with authority final difference after 201', async () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Efectivo contado'), { target: { value: '1540' } })
    fireEvent.change(screen.getByLabelText('Observación'), {
      target: { value: 'Faltante por vuelto' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar cierre' }))
    await screen.findByText('Confirmar cierre de caja')
    const confirmBtns = screen.getAllByRole('button', { name: 'Registrar cierre' })
    fireEvent.click(confirmBtns[confirmBtns.length - 1])
    expect(await screen.findByText('Cierre registrado correctamente.')).toBeInTheDocument()
    expect(screen.getByText(/Volver a Turnos/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver historial de cierres' })).toHaveAttribute(
      'href',
      '/turnos/cierres',
    )
  })

  it('handles invalid declared cash: empty and non-numeric', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Registrar cierre' }))
    expect(
      (await screen.findAllByText('Ingresá el efectivo contado.')).length,
    ).toBeGreaterThanOrEqual(1)
    fireEvent.change(screen.getByLabelText('Efectivo contado'), { target: { value: 'abc' } })
    fireEvent.click(screen.getByRole('button', { name: 'Registrar cierre' }))
    expect(
      (await screen.findAllByText('El efectivo declarado no es un monto válido.')).length,
    ).toBeGreaterThanOrEqual(1)
  })

  it('409 state disables form and shows conflict message', () => {
    closeState = {
      isPending: false,
      isError: true,
      error: new HttpError(409, { detail: 'La caja ya fue cerrada.' }),
    }
    closeMutateAsync = vi.fn().mockRejectedValue(closeState.error)
    renderPage()
    expect(
      screen.getByText('La caja ya fue cerrada. Actualizá el estado operativo.'),
    ).toBeInTheDocument()
  })
})
