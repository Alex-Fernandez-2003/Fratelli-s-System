import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AttendanceReport, InventoryReport, SalesReport } from './api'
import {
  useAttendanceReport,
  useAttendanceReportFilterState,
  useInventoryReport,
  useSalesReport,
  useSalesReportFilterState,
} from './api'
import {
  AttendanceReportPage,
  InventoryReportPage,
  ReportExportActions,
  ResponsiveFilterPanel,
  SalesReportPage,
  attendanceHistoryHref,
} from './pages'
import { normalizeInventoryReport } from './export'

vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => ({ user: { roles: ['CONTADORA'] } }),
}))

vi.mock('./api', async () => {
  const actual = await vi.importActual<typeof import('./api')>('./api')
  return {
    ...actual,
    useAttendanceReport: vi.fn(),
    useAttendanceReportFilterState: vi.fn(),
    useInventoryReport: vi.fn(),
    useSalesReport: vi.fn(),
    useSalesReportFilterState: vi.fn(),
  }
})

const emptySales: SalesReport = {
  salesCount: 0,
  totalAmount: 0,
  cashTotal: 0,
  qrTotal: 0,
  externalTotal: 0,
  directTotal: 0,
  pedidosYaTotal: 0,
  series: [],
}
const emptyInventory: InventoryReport = {
  totalCount: 0,
  lowCount: 0,
  negativeCount: 0,
  items: [],
}
const emptyAttendance: AttendanceReport = {
  items: [],
  summary: {
    attendanceCount: 0,
    totalWorkedMinutes: 0,
    workedHours: 0,
    lateCount: 0,
    absenceCount: 0,
    projectedPay: 0,
  },
}

const baseFilters = { from: '2026-08-01', to: '2026-08-31' }
const filterState = {
  filters: baseFilters,
  updateFilters: vi.fn(),
  clearFilters: vi.fn(),
}

function queryState<T>(data: T, overrides: Record<string, unknown> = {}) {
  return {
    data,
    isLoading: false,
    isFetching: false,
    isPlaceholderData: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  vi.mocked(useSalesReportFilterState).mockReturnValue(filterState)
  vi.mocked(useAttendanceReportFilterState).mockReturnValue(filterState)
  vi.mocked(useSalesReport).mockReturnValue(queryState(emptySales) as never)
  vi.mocked(useInventoryReport).mockReturnValue(queryState(emptyInventory) as never)
  vi.mocked(useAttendanceReport).mockReturnValue(queryState(emptyAttendance) as never)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 })
})

describe('report page response states', () => {
  it('renders authoritative Sales zero summaries and empty trend sections', () => {
    render(
      <MemoryRouter>
        <SalesReportPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('region', { name: 'Resumen de ventas' })).toBeInTheDocument()
    expect(screen.getByText('Distribución por canal')).toBeInTheDocument()
    expect(screen.getByText('Sin puntos de tendencia')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'CSV' })[0]).toBeDisabled()
  })

  it('renders Inventory cards and explicit empty rows for a valid zero response', () => {
    render(
      <MemoryRouter>
        <InventoryReportPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('region', { name: 'Resumen de inventario' })).toBeInTheDocument()
    expect(screen.getByText('Sin existencias')).toBeInTheDocument()
  })

  it('renders Attendance summary and explicit empty rows for a valid zero response', () => {
    render(
      <MemoryRouter>
        <AttendanceReportPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('region', { name: 'Resumen de asistencia' })).toBeInTheDocument()
    expect(screen.getByText('Sin registros')).toBeInTheDocument()
  })

  it('does not enable exports for placeholder data while a new filter request is active', () => {
    const report = normalizeInventoryReport({
      totalCount: 1,
      lowCount: 0,
      negativeCount: 0,
      items: [
        {
          productId: 'p-1',
          productName: 'Producto',
          quantity: 1,
          minStock: null,
          stockState: 'NORMAL',
          unitSymbol: 'u',
        },
      ],
    })
    render(<ReportExportActions report={report} stale />)

    expect(screen.getByRole('button', { name: 'CSV' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'XLSX' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'PDF' })).toBeDisabled()
    expect(screen.getByText('Actualizando filtros…')).toBeInTheDocument()
  })
})

describe('responsive report filters and HU-024 links', () => {
  it('opens and closes one accessible mobile filter dialog', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 375 })
    render(
      <ResponsiveFilterPanel title="Filtros de ventas" onClear={vi.fn()}>
        <label htmlFor="mobile-from">Desde</label>
        <input id="mobile-from" type="date" />
      </ResponsiveFilterPanel>,
    )

    const trigger = screen.getByRole('button', { name: 'Filtros' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Filtros de ventas' })).toBeInTheDocument()
    expect(screen.getByLabelText('Desde')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('uses the plain HU-024 attendance route without ignored query parameters', () => {
    expect(attendanceHistoryHref()).toBe('/asistencia')
  })

  it('renders attendance detail links as the plain HU-024 route', () => {
    const report: AttendanceReport = {
      items: [
        {
          employeeId: 'employee-1',
          fullName: 'Ana Pérez',
          attendanceCount: 1,
          workedMinutes: 480,
          workedHours: 8,
          lateCount: 0,
          absenceCount: 0,
          hourlyRate: 10,
          projectedPay: 80,
        },
      ],
      summary: {
        attendanceCount: 1,
        totalWorkedMinutes: 480,
        workedHours: 8,
        lateCount: 0,
        absenceCount: 0,
        projectedPay: 80,
      },
    }
    vi.mocked(useAttendanceReport).mockReturnValue(queryState(report) as never)

    render(
      <MemoryRouter>
        <AttendanceReportPage />
      </MemoryRouter>,
    )

    expect(screen.getAllByRole('link', { name: 'Ver asistencia' })[0]).toHaveAttribute(
      'href',
      '/asistencia',
    )
  })
})
