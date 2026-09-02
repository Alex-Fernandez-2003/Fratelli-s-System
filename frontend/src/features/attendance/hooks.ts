import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { attendanceApi, attendanceKeys } from './api'
import type {
  AdministrativeAttendanceFilters,
  AdministrativeAttendanceParams,
  MyAttendanceFilters,
  MyAttendanceParams,
} from './api'

export { attendanceKeys } from './api'

function invalidateSelfAttendance(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: attendanceKeys.current() })
  void queryClient.invalidateQueries({ queryKey: attendanceKeys.history() })
  void queryClient.invalidateQueries({ queryKey: attendanceKeys.admin() })
}

export function useAttendanceToday(enabled: boolean, refetchIntervalMs = 30_000) {
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: attendanceApi.today,
    enabled,
    refetchInterval: refetchIntervalMs,
  })
}

export function useAttendanceCurrent(enabled = true) {
  return useQuery({
    queryKey: attendanceKeys.current(),
    queryFn: attendanceApi.current,
    enabled,
    retry: false,
    staleTime: 15_000,
  })
}

export const useMyAttendanceCurrent = useAttendanceCurrent
export const useCurrentAttendance = useAttendanceCurrent

export function useMyAttendance(
  params: MyAttendanceParams | MyAttendanceFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: attendanceKeys.history(params),
    queryFn: () => attendanceApi.me(params),
    enabled,
    retry: false,
    placeholderData: (previous) => previous,
  })
}

export const useMyAttendanceHistory = useMyAttendance

export function useAttendanceAdmin(
  params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {},
) {
  return useQuery({
    queryKey: attendanceKeys.admin(params),
    queryFn: () => attendanceApi.admin(params),
    retry: false,
    placeholderData: (previous) => previous,
  })
}

export const useAdministrativeAttendance = useAttendanceAdmin
export const useAttendanceAdminList = useAttendanceAdmin

export function useAttendanceAdminOptions(
  params: AdministrativeAttendanceParams | AdministrativeAttendanceFilters = {},
) {
  return useQuery({
    queryKey: attendanceKeys.adminOptions(params),
    queryFn: () => attendanceApi.adminOptions(params),
    retry: false,
    staleTime: 30_000,
  })
}

export const useAdministrativeAttendanceOptions = useAttendanceAdminOptions
export const useAttendanceOptions = useAttendanceAdminOptions

export function useCheckInSelf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => attendanceApi.checkInSelf(),
    retry: false,
    onSuccess: () => invalidateSelfAttendance(queryClient),
  })
}

export function useCheckOutSelf() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => attendanceApi.checkOutSelf(),
    retry: false,
    onSuccess: () => invalidateSelfAttendance(queryClient),
  })
}

export const useSelfCheckIn = useCheckInSelf
export const useSelfCheckOut = useCheckOutSelf

export function useCheckIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: string) => attendanceApi.checkIn(employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.today() })
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.admin() })
    },
  })
}

export function useCheckOut() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: string) => attendanceApi.checkOut(employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.today() })
      void queryClient.invalidateQueries({ queryKey: attendanceKeys.admin() })
    },
  })
}
