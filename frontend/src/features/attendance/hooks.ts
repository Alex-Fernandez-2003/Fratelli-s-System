import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { attendanceApi } from './api'
import type { MyAttendanceParams } from './api'

const ATTENDANCE_KEY = 'attendance'

export function useAttendanceToday(enabled: boolean, refetchIntervalMs = 30_000) {
  return useQuery({
    queryKey: [ATTENDANCE_KEY, 'today'],
    queryFn: attendanceApi.today,
    enabled,
    refetchInterval: refetchIntervalMs,
  })
}

export function useMyAttendance(params: MyAttendanceParams) {
  return useQuery({
    queryKey: [ATTENDANCE_KEY, 'me', params],
    queryFn: () => attendanceApi.me(params),
  })
}

export function useCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: string) => attendanceApi.checkIn(employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ATTENDANCE_KEY] })
    },
  })
}

export function useCheckOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: string) => attendanceApi.checkOut(employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [ATTENDANCE_KEY] })
    },
  })
}
