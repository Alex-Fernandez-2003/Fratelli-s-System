import { useState } from 'react'
import type { components, paths } from '../../types/api.generated'
import { endpoints } from '../../lib/api/endpoints'
import { httpClient } from '../../lib/api/http-client'
import { businessDate } from '../../lib/business-time'

export type AttendanceRecordDto = components['schemas']['AttendanceRecordDto']
export type PersonalAttendanceRecordDto = components['schemas']['PersonalAttendanceRecordDto']
export type AttendanceCurrentResponse = components['schemas']['AttendanceCurrentResponse']
export type AttendanceTodayResponse = components['schemas']['AttendanceTodayResponse']
export type AttendanceTodayItem = components['schemas']['AttendanceTodayItem']
export type AttendancePage = components['schemas']['AttendancePage']
export type AdministrativeAttendanceRow = components['schemas']['AdministrativeAttendanceRow']
export type AdministrativeAttendancePage = components['schemas']['AdministrativeAttendancePage']
export type AdministrativeAttendanceSummary =
  components['schemas']['AdministrativeAttendanceSummary']
export type EmployeeAttendanceSummary = components['schemas']['EmployeeAttendanceSummary']
export type AttendanceLifecycle = components['schemas']['AttendanceLifecycle']
export type ShiftType = components['schemas']['ShiftType']

export type MyAttendanceParams = NonNullable<
  paths['/api/v1/attendance/me']['get']['parameters']['query']
>
export type AdministrativeAttendanceParams = NonNullable<
  paths['/api/v1/attendance/admin']['get']['parameters']['query']
>

export type MyAttendanceFilters = MyAttendanceParams & {
  page: number
  pageSize: number
}

export type AdministrativeAttendanceFilters = Omit<
  AdministrativeAttendanceParams,
  'page' | 'pageSize' | 'late'
> & {
  page: number
  pageSize: number
}

type AttendanceAdminFilterUpdates = Partial<
  Omit<AdministrativeAttendanceFilters, 'page' | 'pageSize'>
>
type MyAttendanceFilterUpdates = Partial<Omit<MyAttendanceFilters, 'page' | 'pageSize'>>

export const ATTENDANCE_PAGE_SIZE = 20
export const ATTENDANCE_OPTIONS_PAGE_SIZE = 100

function optionalText(value: string | undefined): string | undefined {
  return value?.trim() || undefined
}

function positiveInteger(value: number | string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 1 ? Math.trunc(parsed) : fallback
}

export function normalizeMyAttendanceParams(
  params: MyAttendanceParams | MyAttendanceFilters = {},
): MyAttendanceFilters {
  return {
    from: optionalText(params.from),
    to: optionalText(params.to),
    page: positiveInteger(params.page, 1),
    pageSize: positiveInteger(params.pageSize, ATTENDANCE_PAGE_SIZE),
  }
}

export function normalizeAdministrativeAttendanceParams(
  params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {},
) {
  return {
    employeeId: optionalText(params.employeeId),
    from: optionalText(params.from),
    to: optionalText(params.to),
    shiftType: params.shiftType || undefined,
    outcome: params.outcome || undefined,
    late: 'late' in params ? params.late : undefined,
    page: positiveInteger(params.page, 1),
    pageSize: positiveInteger(params.pageSize, ATTENDANCE_PAGE_SIZE),
  }
}

export function createMyAttendanceFilters(date = new Date()): MyAttendanceFilters {
  const today = businessDate(date)
  return { from: `${today.slice(0, 7)}-01`, to: today, page: 1, pageSize: ATTENDANCE_PAGE_SIZE }
}

export function updateMyAttendanceFilters(
  filters: MyAttendanceFilters,
  updates: MyAttendanceFilterUpdates,
): MyAttendanceFilters {
  return { ...filters, ...updates, page: 1 }
}

export function setMyAttendancePage(
  filters: MyAttendanceFilters,
  page: number,
): MyAttendanceFilters {
  return { ...filters, page: positiveInteger(page, 1) }
}

export function useMyAttendanceFilterState(date = new Date()) {
  const [filters, setFilters] = useState(() => createMyAttendanceFilters(date))
  return {
    filters,
    updateFilters: (updates: MyAttendanceFilterUpdates) =>
      setFilters((current) => updateMyAttendanceFilters(current, updates)),
    setPage: (page: number) => setFilters((current) => setMyAttendancePage(current, page)),
    clearFilters: () => setFilters(createMyAttendanceFilters()),
  }
}

export function createAdministrativeAttendanceFilters(
  date = new Date(),
): AdministrativeAttendanceFilters {
  const today = businessDate(date)
  return {
    from: `${today.slice(0, 7)}-01`,
    to: today,
    page: 1,
    pageSize: ATTENDANCE_PAGE_SIZE,
  }
}

export function updateAdministrativeAttendanceFilters(
  filters: AdministrativeAttendanceFilters,
  updates: AttendanceAdminFilterUpdates,
): AdministrativeAttendanceFilters {
  return { ...filters, ...updates, page: 1 }
}

export function setAdministrativeAttendancePage(
  filters: AdministrativeAttendanceFilters,
  page: number,
): AdministrativeAttendanceFilters {
  return { ...filters, page: positiveInteger(page, 1) }
}

export function useAdministrativeAttendanceFilterState(date = new Date()) {
  const [filters, setFilters] = useState(() => createAdministrativeAttendanceFilters(date))
  return {
    filters,
    updateFilters: (updates: AttendanceAdminFilterUpdates) =>
      setFilters((current) => updateAdministrativeAttendanceFilters(current, updates)),
    setPage: (page: number) =>
      setFilters((current) => setAdministrativeAttendancePage(current, page)),
    clearFilters: () => setFilters(createAdministrativeAttendanceFilters()),
  }
}

function buildMeQuery(params: MyAttendanceParams | MyAttendanceFilters = {}): string {
  const values = normalizeMyAttendanceParams(params)
  const search = new URLSearchParams()
  if (values.from) search.set('from', values.from)
  if (values.to) search.set('to', values.to)
  search.set('page', String(values.page))
  search.set('pageSize', String(values.pageSize))
  return search.toString()
}

function administrativePath(
  params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {},
): string {
  const values = normalizeAdministrativeAttendanceParams(params)
  return endpoints.attendance.admin({
    employeeId: values.employeeId,
    from: values.from,
    to: values.to,
    shiftType: values.shiftType,
    outcome: values.outcome,
    late: values.late,
    page: values.page,
    pageSize: values.pageSize,
  })
}

function administrativeOptionsParams(
  params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {},
): AdministrativeAttendanceParams {
  const values = normalizeAdministrativeAttendanceParams(params)
  return {
    employeeId: undefined,
    from: values.from,
    to: values.to,
    shiftType: values.shiftType,
    outcome: values.outcome,
    late: values.late,
    page: 1,
    pageSize: ATTENDANCE_OPTIONS_PAGE_SIZE,
  }
}

export const attendanceKeys = {
  all: ['attendance'] as const,
  today: () => [...attendanceKeys.all, 'today'] as const,
  self: () => [...attendanceKeys.all, 'me'] as const,
  current: () => [...attendanceKeys.self(), 'current'] as const,
  history: (params?: MyAttendanceParams | MyAttendanceFilters) =>
    params === undefined
      ? ([...attendanceKeys.self(), 'history'] as const)
      : ([...attendanceKeys.self(), 'history', normalizeMyAttendanceParams(params)] as const),
  admin: (params?: AdministrativeAttendanceParams | AdministrativeAttendanceFilters) =>
    params === undefined
      ? ([...attendanceKeys.all, 'admin'] as const)
      : ([
          ...attendanceKeys.all,
          'admin',
          'list',
          normalizeAdministrativeAttendanceParams(params),
        ] as const),
  adminOptions: (params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {}) =>
    [
      ...attendanceKeys.all,
      'admin',
      'options',
      normalizeAdministrativeAttendanceParams(administrativeOptionsParams(params)),
    ] as const,
}

export const attendanceApi = {
  today: () => httpClient.get<AttendanceTodayResponse>(endpoints.attendance.today),
  checkIn: (employeeId: string) =>
    httpClient.post<AttendanceRecordDto>(endpoints.attendance.checkIn(employeeId)),
  checkOut: (employeeId: string) =>
    httpClient.post<AttendanceRecordDto>(endpoints.attendance.checkOut(employeeId)),
  me: (params: MyAttendanceParams | MyAttendanceFilters = {}) =>
    httpClient.get<AttendancePage>(`${endpoints.attendance.me}?${buildMeQuery(params)}`),
  history: (params: MyAttendanceParams | MyAttendanceFilters = {}) =>
    httpClient.get<AttendancePage>(`${endpoints.attendance.me}?${buildMeQuery(params)}`),
  current: () => httpClient.get<AttendanceCurrentResponse>(endpoints.attendance.meCurrent),
  meCurrent: () => httpClient.get<AttendanceCurrentResponse>(endpoints.attendance.meCurrent),
  checkInSelf: () => httpClient.post<PersonalAttendanceRecordDto>(endpoints.attendance.meCheckIn),
  meCheckIn: () => httpClient.post<PersonalAttendanceRecordDto>(endpoints.attendance.meCheckIn),
  checkOutSelf: () => httpClient.post<PersonalAttendanceRecordDto>(endpoints.attendance.meCheckOut),
  meCheckOut: () => httpClient.post<PersonalAttendanceRecordDto>(endpoints.attendance.meCheckOut),
  admin: (params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {}) =>
    httpClient.get<AdministrativeAttendancePage>(administrativePath(params)),
  adminList: (params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {}) =>
    httpClient.get<AdministrativeAttendancePage>(administrativePath(params)),
  adminOptions: (params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {}) =>
    httpClient.get<AdministrativeAttendancePage>(
      administrativePath(administrativeOptionsParams(params)),
    ),
}

export const fetchMyAttendance = (params: MyAttendanceParams | MyAttendanceFilters = {}) =>
  attendanceApi.me(params)
export const fetchAttendanceAdmin = (
  params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {},
) => attendanceApi.admin(params)
export const fetchAttendanceAdminOptions = (
  params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {},
) => attendanceApi.adminOptions(params)
