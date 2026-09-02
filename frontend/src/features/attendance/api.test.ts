import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '../../lib/api/http-client'
import { businessDate } from '../../lib/business-time'
import {
  attendanceApi,
  attendanceKeys,
  createAdministrativeAttendanceFilters,
  createMyAttendanceFilters,
  fetchAttendanceAdminOptions,
  normalizeAdministrativeAttendanceParams,
  normalizeMyAttendanceParams,
  updateAdministrativeAttendanceFilters,
  updateMyAttendanceFilters,
} from './api'
import { useCheckInSelf } from './hooks'

vi.mock('../../lib/api/http-client', () => ({
  httpClient: { get: vi.fn(), post: vi.fn() },
}))

function wrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children)
}

describe('Attendance query layer', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uses the business month and keeps BusinessDate away from browser UTC parsing', () => {
    const instant = new Date('2026-08-31T02:30:00.000Z')
    expect(businessDate(instant)).toBe('2026-08-30')
    expect(createMyAttendanceFilters(instant)).toMatchObject({
      from: '2026-08-01',
      to: '2026-08-30',
      page: 1,
    })
    expect(createAdministrativeAttendanceFilters(instant)).toMatchObject({
      from: '2026-08-01',
      to: '2026-08-30',
      page: 1,
    })
  })

  it('normalizes optional values and forwards generated attendance filters', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ items: [] })

    expect(normalizeMyAttendanceParams({ from: ' ', to: '', page: 3 })).toMatchObject({
      from: undefined,
      to: undefined,
      page: 3,
    })
    expect(
      normalizeAdministrativeAttendanceParams({
        employeeId: '  ',
        shiftType: 'NIGHT',
        outcome: 'ABSENT',
      }),
    ).toMatchObject({ employeeId: undefined, shiftType: 'NIGHT', outcome: 'ABSENT' })

    await attendanceApi.me({ from: '', to: ' ', page: 2, pageSize: 25 })
    expect(httpClient.get).toHaveBeenLastCalledWith('/api/v1/attendance/me?page=2&pageSize=25')

    await attendanceApi.admin({
      employeeId: ' employee-1 ',
      from: '2026-08-01',
      to: '2026-08-30',
      shiftType: 'NIGHT',
      outcome: 'ABSENT',
      late: false,
      page: 3,
      pageSize: 10,
    })
    expect(httpClient.get).toHaveBeenLastCalledWith(
      '/api/v1/attendance/admin?employeeId=employee-1&from=2026-08-01&to=2026-08-30&shiftType=NIGHT&outcome=ABSENT&late=false&page=3&pageSize=10',
    )
  })

  it('keys normalized filters and resets pagination without losing the selected filters', () => {
    const myFilters = createMyAttendanceFilters(new Date('2026-08-30T12:00:00Z'))
    const adminFilters = createAdministrativeAttendanceFilters(new Date('2026-08-30T12:00:00Z'))

    expect(
      updateMyAttendanceFilters({ ...myFilters, page: 4 }, { to: '2026-08-29' }),
    ).toMatchObject({
      to: '2026-08-29',
      page: 1,
    })
    expect(
      updateAdministrativeAttendanceFilters(
        { ...adminFilters, page: 4 },
        { shiftType: 'MORNING', outcome: 'CLOSED' },
      ),
    ).toMatchObject({ shiftType: 'MORNING', outcome: 'CLOSED', page: 1 })
    expect(attendanceKeys.history({ from: '', to: '2026-08-30', page: 2 })).toEqual(
      attendanceKeys.history({ to: '2026-08-30', page: 2 }),
    )
    expect(attendanceKeys.admin({ ...adminFilters, employeeId: 'employee-1' })).not.toEqual(
      attendanceKeys.admin({ ...adminFilters, employeeId: 'employee-2' }),
    )
    expect(attendanceKeys.admin({ ...adminFilters, page: 2 })).not.toEqual(
      attendanceKeys.admin({ ...adminFilters, page: 1 }),
    )
  })

  it('loads employee options through the authorized administrative response, not a users endpoint', async () => {
    vi.mocked(httpClient.get).mockResolvedValue({ items: [], employeeSummaries: [] })

    await fetchAttendanceAdminOptions({ from: '2026-08-01', to: '2026-08-30' })

    expect(httpClient.get).toHaveBeenCalledWith(
      '/api/v1/attendance/admin?from=2026-08-01&to=2026-08-30&page=1&pageSize=100',
    )
  })

  it('runs self mutations without an EmployeeId, disables automatic retry, and invalidates only attendance scopes', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({ id: 'record-1' })
    const client = new QueryClient()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    const { result } = renderHook(() => useCheckInSelf(), { wrapper: wrapper(client) })

    await act(async () => {
      await result.current.mutateAsync()
    })
    await waitFor(() => expect(invalidate).toHaveBeenCalled())

    expect(httpClient.post).toHaveBeenCalledWith('/api/v1/attendance/me/check-in')
    expect(invalidate).toHaveBeenCalledWith({ queryKey: attendanceKeys.current() })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: attendanceKeys.history() })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: attendanceKeys.admin() })
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: attendanceKeys.all })
  })
})
