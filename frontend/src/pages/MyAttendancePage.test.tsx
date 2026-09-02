import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '../lib/api/http-client'
import type {
  AttendanceCurrentResponse,
  AttendancePage,
  MyAttendanceFilters,
  PersonalAttendanceRecordDto,
} from '../features/attendance/api'
import { MyAttendancePage } from './MyAttendancePage'

const attendanceMocks = vi.hoisted(() => ({
  useAttendanceCurrent: vi.fn(),
  useMyAttendance: vi.fn(),
  useCheckInSelf: vi.fn(),
  useCheckOutSelf: vi.fn(),
}))
vi.mock('../features/attendance/hooks', () => attendanceMocks)

const employeeId = '00000000-0000-0000-0000-000000000001'
const baseRecord: PersonalAttendanceRecordDto = {
  id: 'record-1',
  employeeId,
  businessDate: '2026-09-30',
  checkInAt: '2026-09-30T13:00:00.000Z',
  checkInByUserId: 'user-1',
  checkOutAt: '2026-09-30T21:00:00.000Z',
  checkOutByUserId: 'user-1',
  shiftId: 'shift-1',
  shiftType: 'MORNING' as const,
  plannedStart: '2026-09-30T13:00:00.000Z',
  plannedEnd: '2026-09-30T21:00:00.000Z',
  lifecycle: 'CLOSED' as const,
  workedMinutes: 480,
  isLate: false,
  lateMinutes: 0,
}
const secondSameDayRecord = { ...baseRecord, id: 'record-2', checkInAt: '2026-09-30T22:00:00.000Z' }

type CurrentQuery = {
  data?: AttendanceCurrentResponse
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  refetch: () => void
}
type HistoryQuery = {
  data?: AttendancePage
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error: unknown
  refetch: () => void
}
type MutationOptions = {
  onSuccess?: (record: PersonalAttendanceRecordDto) => void
  onError?: (error: unknown) => void
}
type MutationQuery = {
  data?: PersonalAttendanceRecordDto
  error: unknown
  isPending: boolean
  isSuccess: boolean
  mutate: (variables?: undefined, options?: MutationOptions) => void
}

let currentQuery: CurrentQuery
let historyQuery: HistoryQuery
let checkInMutation: MutationQuery
let checkOutMutation: MutationQuery
let historyCalls: Array<{ filters: MyAttendanceFilters; enabled: boolean }> = []

function renderPage() {
  return render(
    <MemoryRouter>
      <MyAttendancePage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-30T16:00:00.000Z'))
  historyCalls = []
  currentQuery = {
    data: {
      businessDate: '2026-09-30',
      timeZone: 'America/La_Paz',
      employeeId,
      lifecycle: 'NO_RECORD',
      record: null,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }
  historyQuery = {
    data: {
      items: [baseRecord, secondSameDayRecord],
      page: 1,
      pageSize: 20,
      totalCount: 2,
      totalPages: 1,
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }
  checkInMutation = {
    data: undefined,
    error: null,
    isPending: false,
    isSuccess: false,
    mutate: vi.fn(),
  }
  checkOutMutation = {
    data: undefined,
    error: null,
    isPending: false,
    isSuccess: false,
    mutate: vi.fn(),
  }
  attendanceMocks.useAttendanceCurrent.mockImplementation(() => currentQuery)
  attendanceMocks.useMyAttendance.mockImplementation(
    (filters: MyAttendanceFilters, enabled: boolean) => {
      historyCalls.push({ filters, enabled })
      return historyQuery
    },
  )
  attendanceMocks.useCheckInSelf.mockImplementation(() => checkInMutation)
  attendanceMocks.useCheckOutSelf.mockImplementation(() => checkOutMutation)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.clearAllMocks()
})

describe('MyAttendancePage HU-023', () => {
  it('shows a distinct no-open state, server history, and repeated records on one date', () => {
    renderPage()

    expect(screen.getByText('Sin entrada')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Registrar entrada' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Registrar salida' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Historial de asistencia' })).toBeInTheDocument()
    expect(screen.getAllByText('8h 0m').length).toBeGreaterThan(0)
    expect(historyCalls[0]).toMatchObject({
      enabled: true,
      filters: { from: '2026-09-01', to: '2026-09-30', page: 1 },
    })
  })

  it('renders only the exit action for an OPEN authoritative current record and updates elapsed locally', () => {
    currentQuery = {
      ...currentQuery,
      data: {
        ...currentQuery.data,
        lifecycle: 'OPEN',
        record: {
          ...baseRecord,
          checkOutAt: null,
          checkOutByUserId: null,
          lifecycle: 'OPEN',
          workedMinutes: null,
          isLate: true,
          lateMinutes: 7,
        },
      },
    }

    renderPage()

    expect(screen.getByRole('button', { name: 'Registrar salida' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Registrar entrada' })).not.toBeInTheDocument()
    expect(screen.getByText('Tarde · 7 min')).toBeInTheDocument()
    expect(screen.getByText('3h 0m')).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(60_000))
    expect(screen.getByText('3h 1m')).toBeInTheDocument()
    expect(currentQuery.refetch).not.toHaveBeenCalled()
  })

  it('renders the semantic employee-not-linked 404 state and does not invent empty history', () => {
    currentQuery = {
      ...currentQuery,
      data: undefined,
      isError: true,
      error: new HttpError(404, {}),
    }

    renderPage()

    expect(
      screen.getByText('Tu usuario no está vinculado a un registro de empleado.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/administrador o encargado/i)).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Historial de asistencia' }),
    ).not.toBeInTheDocument()
    expect(historyCalls[0]).toMatchObject({ enabled: false })
  })

  it('prevents double submission while the self mutation is pending', () => {
    checkInMutation.isPending = true
    renderPage()

    const button = screen.getByRole('button', { name: /Registrar entrada/ })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(checkInMutation.mutate).not.toHaveBeenCalled()
  })

  it('uses the mutation response for feedback, sends no EmployeeId, and refetches current state', () => {
    const response = { ...baseRecord, checkOutAt: null, lifecycle: 'OPEN' as const }
    checkInMutation.mutate = vi.fn((_variables: undefined, options?: MutationOptions) => {
      options?.onSuccess?.(response)
    })
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Registrar entrada' }))

    expect(checkInMutation.mutate).toHaveBeenCalledWith(undefined, expect.any(Object))
    expect(screen.getByRole('alert')).toHaveTextContent('Entrada registrada')
    expect(currentQuery.refetch).toHaveBeenCalled()
  })

  it('keeps history server-paginated and resets page when a period filter changes', () => {
    historyQuery = {
      ...historyQuery,
      data: { ...historyQuery.data, totalCount: 41, totalPages: 3 },
    }
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Página siguiente de mi asistencia' }))
    expect(historyCalls.at(-1)?.filters.page).toBe(2)

    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-08-01' } })
    expect(historyCalls.at(-1)?.filters).toMatchObject({ from: '2026-08-01', page: 1 })
  })
})
