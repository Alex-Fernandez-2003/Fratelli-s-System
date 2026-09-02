import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  AdministrativeAttendancePage as AdministrativePageData,
  AdministrativeAttendanceRow,
  EmployeeAttendanceSummary,
} from './api'
import { AdministrativeAttendancePage } from './AdministrativeAttendancePage'

const attendanceMocks = vi.hoisted(() => ({
  useAttendanceAdmin: vi.fn(),
  useAttendanceAdminOptions: vi.fn(),
}))
vi.mock('./hooks', () => attendanceMocks)

const row: AdministrativeAttendanceRow = {
  employeeId: 'employee-1',
  fullName: 'Ana López',
  businessDate: '2026-09-01',
  shiftType: 'MORNING',
  plannedStart: '2026-09-01T13:00:00.000Z',
  plannedEnd: '2026-09-01T21:00:00.000Z',
  checkInAt: '2026-09-01T13:05:00.000Z',
  checkOutAt: '2026-09-01T21:00:00.000Z',
  outcome: 'CLOSED',
  workedMinutes: 475,
  isLate: true,
  lateMinutes: 5,
}
const secondRow: AdministrativeAttendanceRow = {
  ...row,
  businessDate: '2026-09-01',
  shiftType: 'NIGHT',
  plannedStart: '2026-09-01T22:00:00.000Z',
  plannedEnd: '2026-09-02T06:00:00.000Z',
  checkInAt: null,
  checkOutAt: null,
  outcome: 'ABSENT',
  workedMinutes: null,
  isLate: false,
  lateMinutes: 0,
}
const anaSummary: EmployeeAttendanceSummary = {
  employeeId: 'employee-1',
  fullName: 'Ana López',
  workedMinutes: 475,
  lateCount: 1,
  absenceCount: 0,
  attendanceCount: 1,
}
const employeeOptions: EmployeeAttendanceSummary[] = [
  anaSummary,
  {
    employeeId: 'employee-2',
    fullName: 'Bruno Díaz',
    workedMinutes: 120,
    lateCount: 0,
    absenceCount: 1,
    attendanceCount: 1,
  },
]

type AttendanceQuery = {
  data?: AdministrativePageData
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  refetch: () => void
}
type OptionsQuery = {
  data?: { employeeSummaries: EmployeeAttendanceSummary[] }
  isLoading: boolean
  isError: boolean
  error: unknown
  refetch: () => void
}

let adminQuery: AttendanceQuery
let optionsQuery: OptionsQuery
let adminCalls: Array<{ filters: Record<string, unknown> }> = []

function renderPage() {
  return render(
    <MemoryRouter>
      <AdministrativeAttendancePage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-30T16:00:00.000Z'))
  adminCalls = []
  adminQuery = {
    data: {
      items: [row, secondRow],
      page: 1,
      pageSize: 20,
      totalCount: 77,
      totalPages: 4,
      summary: {
        totalRecords: 77,
        openCount: 3,
        closedCount: 60,
        totalWorkedMinutes: 125,
        lateCount: 9,
        absenceCount: 4,
      },
      employeeSummaries: [anaSummary],
    } satisfies AdministrativePageData,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }
  optionsQuery = {
    data: { employeeSummaries: employeeOptions },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }
  attendanceMocks.useAttendanceAdmin.mockImplementation((filters: Record<string, unknown>) => {
    adminCalls.push({ filters })
    return adminQuery
  })
  attendanceMocks.useAttendanceAdminOptions.mockImplementation(() => optionsQuery)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('AdministrativeAttendancePage HU-024', () => {
  it('renders four server-backed summary cards and authoritative rows without mock metrics', () => {
    renderPage()

    expect(screen.getByText('Registros totales')).toBeInTheDocument()
    expect(screen.getByText('Llegadas tarde')).toBeInTheDocument()
    expect(screen.getByText('Tiempo trabajado')).toBeInTheDocument()
    expect(screen.getByText('Ausencias')).toBeInTheDocument()
    expect(screen.getByText('2h 5m')).toBeInTheDocument()
    expect(screen.queryByText(/Activos ahora/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Retrasos hoy/i)).not.toBeInTheDocument()
    expect(screen.getAllByText('Ana López').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Tarde · 5 min').length).toBeGreaterThan(0)
    expect(screen.getByText('Mostrando 1–20 de 77')).toBeInTheDocument()
  })

  it('gets employee options from employeeSummaries, forwards filters, and resets pagination', () => {
    adminQuery = {
      ...adminQuery,
      data: { ...adminQuery.data, employeeSummaries: [] },
    }
    renderPage()

    expect(screen.getByRole('option', { name: 'Ana López' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Bruno Díaz' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/usuario/i)).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Empleado'), { target: { value: 'employee-2' } })
    fireEvent.change(screen.getByLabelText('Turno'), { target: { value: 'NIGHT' } })
    fireEvent.change(screen.getByLabelText('Resultado'), { target: { value: 'ABSENT' } })
    expect(adminCalls.at(-1)?.filters).toMatchObject({
      employeeId: 'employee-2',
      shiftType: 'NIGHT',
      outcome: 'ABSENT',
      page: 1,
    })

    expect(screen.getByRole('button', { name: 'Limpiar al mes actual' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar al mes actual' }))
    expect(adminCalls.at(-1)?.filters).toMatchObject({ page: 1 })
  })

  it('shows contextual backend employee stats and opens only a read-only detail modal', () => {
    renderPage()
    fireEvent.change(screen.getByLabelText('Empleado'), { target: { value: 'employee-1' } })

    expect(screen.getByText('Resumen de Ana López')).toBeInTheDocument()
    expect(
      screen.getByText('Estadísticas del empleado para los filtros actuales.'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getAllByRole('button', { name: 'Ver detalle' })[0])

    const dialog = screen.getByRole('dialog', { name: 'Detalle de asistencia' })
    expect(within(dialog).getByText('Ana López')).toBeInTheDocument()
    expect(within(dialog).getByText('Tarde · 5 min')).toBeInTheDocument()
    expect(
      within(dialog).queryByRole('button', {
        name: /editar|eliminar|registrar|justificar|aprobar/i,
      }),
    ).not.toBeInTheDocument()
  })

  it('renders a safe retry state for an administrative failure', () => {
    adminQuery = {
      ...adminQuery,
      data: undefined,
      isError: true,
      error: new Error('offline'),
    }
    renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se pudo cargar la asistencia administrativa.',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar asistencia' }))
    expect(adminQuery.refetch).toHaveBeenCalled()
  })
})
