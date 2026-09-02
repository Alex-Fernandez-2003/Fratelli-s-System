import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CashClosingDto } from './api'
import { CashClosingDetailContent, CashClosingDetailOverlay } from './CashClosingDetailOverlay'

const snapshot: CashClosingDto = {
  id: '00000000-0000-0000-0000-000000000001',
  cashSessionId: '00000000-0000-0000-0000-000000000011',
  businessDate: '2026-02-28',
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
  observation: null,
  closedByUserId: 'actor-1',
  closedAt: '2026-02-28T22:00:00.000Z',
}

let detailState: { data?: CashClosingDto; isLoading?: boolean; error?: unknown } = {}
let requestedIds: Array<string | undefined> = []

vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api')
  return {
    ...actual,
    useCashClosingDetail: (id: string | undefined) => {
      requestedIds.push(id)
      return {
        data: detailState.data,
        isLoading: detailState.isLoading ?? false,
        error: detailState.error,
        refetch: vi.fn(),
      }
    },
  }
})

describe('CashClosingDetailOverlay HU-028', () => {
  beforeEach(() => {
    detailState = { data: snapshot }
    requestedIds = []
  })

  it('uses the persisted snapshot and separates payment methods from channels', () => {
    render(<CashClosingDetailOverlay closingId={snapshot.id} onClose={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: 'Detalle de cierre' })).toBeInTheDocument()
    expect(screen.getByText('Apertura caja principal')).toBeInTheDocument()
    expect(screen.getByText('Apertura caja chica')).toBeInTheDocument()
    expect(screen.getByText('Efectivo retirado')).toBeInTheDocument()
    expect(screen.getByText('Pago externo')).toBeInTheDocument()
    expect(screen.getByText('PedidosYa')).toBeInTheDocument()
    expect(screen.getByTestId('cash-payment-breakdown')).toHaveTextContent('Efectivo')
    expect(screen.getByTestId('cash-payment-breakdown')).toHaveTextContent('Pago externo')
    expect(screen.getByTestId('cash-channel-breakdown')).toHaveTextContent('PedidosYa')
    expect(screen.getByTestId('cash-payment-breakdown')).not.toHaveTextContent('PedidosYa')
    expect(screen.getByText('Faltante')).toBeInTheDocument()
    expect(screen.queryByText(/Observación/)).not.toBeInTheDocument()
    expect(
      screen.queryByText(/Firma|modificación|arrastrado|reabrir|editar|exportar/i),
    ).not.toBeInTheDocument()
  })

  it('does not request detail until a closing id is selected and supports loading/retry states', () => {
    const onClose = vi.fn()
    const { rerender } = render(
      <CashClosingDetailOverlay closingId={undefined} onClose={onClose} />,
    )
    expect(requestedIds).toContain(undefined)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    detailState = { isLoading: true }
    rerender(<CashClosingDetailOverlay closingId={snapshot.id} onClose={onClose} />)
    expect(screen.getByRole('status')).toBeInTheDocument()

    detailState = { error: new Error('failed') }
    rerender(<CashClosingDetailOverlay closingId={snapshot.id} onClose={onClose} />)
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el detalle del cierre.')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar detalle de cierre' }))
  })

  it('renders dash fallbacks when a partially populated API snapshot is received', () => {
    const incomplete = {
      ...snapshot,
      openingAmount: null,
      expectedCash: undefined,
      declaredCash: null,
      difference: undefined,
      closedByUserId: null,
    } as unknown as CashClosingDto

    render(<CashClosingDetailContent closing={incomplete} />)

    expect(screen.getByText('Cerrado por: —')).toBeInTheDocument()
    expect(screen.getByTestId('cash-closing-difference')).toHaveTextContent('—')
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(4)
  })
})
