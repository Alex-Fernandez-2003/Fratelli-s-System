import { endpoints } from '../../lib/api/endpoints'
import { httpClient } from '../../lib/api/http-client'
import type { components } from '../../types/api.generated'

export type AttendanceRecordDto = components['schemas']['AttendanceRecordDto']
export type AttendanceTodayResponse = components['schemas']['AttendanceTodayResponse']
export type AttendanceTodayItem = components['schemas']['AttendanceTodayItem']
export type AttendancePage = components['schemas']['AttendancePage']

export type MyAttendanceParams = {
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

function buildMeQuery(params: MyAttendanceParams): string {
  const search = new URLSearchParams()
  if (params.from) search.set('from', params.from)
  if (params.to) search.set('to', params.to)
  search.set('page', String(params.page ?? 1))
  search.set('pageSize', String(params.pageSize ?? 20))
  return search.toString()
}

export const attendanceApi = {
  today: () => httpClient.get<AttendanceTodayResponse>(endpoints.attendance.today),
  checkIn: (employeeId: string) =>
    httpClient.post<AttendanceRecordDto>(endpoints.attendance.checkIn(employeeId)),
  checkOut: (employeeId: string) =>
    httpClient.post<AttendanceRecordDto>(endpoints.attendance.checkOut(employeeId)),
  me: (params: MyAttendanceParams = {}) =>
    httpClient.get<AttendancePage>(`${endpoints.attendance.me}?${buildMeQuery(params)}`),
}
