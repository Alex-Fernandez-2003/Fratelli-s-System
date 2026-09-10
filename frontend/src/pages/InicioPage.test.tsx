import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthUser } from '../features/auth/api'
import { InicioPage } from './InicioPage'

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useAttendanceCurrent: vi.fn(),
  useCashPreview: vi.fn(),
  useCashClosingHistory: vi.fn(),
  useCommands: vi.fn(),
  useInventorySummary: vi.fn(),
}))

vi.mock('../features/auth/AuthProvider', () => ({ useAuth: mocks.useAuth }))
vi.mock('../features/attendance/hooks', () => ({
  useAttendanceCurrent: mocks.useAttendanceCurrent,
}))
vi.mock('../features/cash/api', () => ({
  CASH_HISTORY_READ_ROLES: ['ADMINISTRADOR', 'ENCARGADO', 'CONTADORA'],
  createCashClosingHistoryFilters: () => ({
    from: '2026-09-01',
    to: '2026-09-30',
    page: 1,
    pageSize: 25,
  }),
  useCashPreview: mocks.useCashPreview,
  useCashClosingHistory: mocks.useCashClosingHistory,
}))
vi.mock('../features/kitchen/api', () => ({ useCommands: mocks.useCommands }))
vi.mock('../features/inventory/api', () => ({ useInventorySummary: mocks.useInventorySummary }))

const user = (roles: string[]): AuthUser => ({
  id: 'user-1',
  username: 'demo',
  fullName: 'Demo User',
  employeeId: 'employee-1',
  roles,
})

function renderPage() {
  return render(
    <MemoryRouter>
      <InicioPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mocks.useAuth.mockReturnValue({
    user: user(['ADMINISTRADOR']),
    logout: vi.fn(),
    pending: false,
    error: null,
  })
  mocks.useAttendanceCurrent.mockReturnValue({
    data: { lifecycle: 'OPEN' },
    isLoading: false,
    error: null,
  })
  mocks.useCashPreview.mockReturnValue({
    data: { expectedCash: 1250, salesTotal: 900, openingAmount: 500, pettyCashOpeningAmount: 100 },
    isLoading: false,
    error: null,
  })
  mocks.useCashClosingHistory.mockReturnValue({
    data: { items: [{ businessDate: '2026-09-30' }], totalCount: 1 },
    isLoading: false,
    error: null,
  })
  mocks.useCommands.mockReturnValue({ data: { totalCount: 3 }, isLoading: false, error: null })
  mocks.useInventorySummary.mockReturnValue({
    data: { lowStockCount: 2 },
    isLoading: false,
    error: null,
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('InicioPage role-aware dashboard', () => {
  it('shows real operational values and attendance navigation for ADMINISTRADOR', () => {
    renderPage()

    expect(screen.getByText('Efectivo esperado')).toBeInTheDocument()
    expect(screen.getAllByText(/Bs/).length).toBeGreaterThan(0)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Asistencia de hoy/ })).toHaveAttribute(
      'href',
      '/asistencia/hoy',
    )
    expect(screen.queryByText('P&L')).not.toBeInTheDocument()
  })

  it('shows the kitchen queue without manager-only cash metrics for COCINA', () => {
    mocks.useAuth.mockReturnValue({
      user: user(['COCINA']),
      logout: vi.fn(),
      pending: false,
      error: null,
    })

    renderPage()

    expect(screen.getByRole('heading', { name: 'Cocina' })).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Registrar producción/ })).toHaveAttribute(
      'href',
      '/produccion/registrar',
    )
    expect(screen.queryByText('Efectivo esperado')).not.toBeInTheDocument()
  })

  it('keeps EMPLEADO attendance-first and does not add unsupported operational widgets', () => {
    mocks.useAuth.mockReturnValue({
      user: user(['EMPLEADO']),
      logout: vi.fn(),
      pending: false,
      error: null,
    })

    renderPage()

    expect(screen.getByRole('link', { name: /Mi asistencia/ })).toHaveAttribute(
      'href',
      '/mi-asistencia',
    )
    expect(screen.queryByRole('heading', { name: 'Cocina' })).not.toBeInTheDocument()
    expect(screen.queryByText('Efectivo esperado')).not.toBeInTheDocument()
  })

  it('composes widgets for multi-role users instead of dropping a capability', () => {
    mocks.useAuth.mockReturnValue({
      user: user(['ENCARGADO', 'CONTADORA']),
      logout: vi.fn(),
      pending: false,
      error: null,
    })

    renderPage()

    expect(screen.getByRole('heading', { name: 'Resumen operativo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cocina' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Control contable' })).toBeInTheDocument()
  })
})
