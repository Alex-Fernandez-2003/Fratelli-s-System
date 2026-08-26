export const endpoints = {
  health: '/health',
  auth: {
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
  },
  attendance: {
    today: '/api/v1/attendance/employees/today',
    checkIn: (employeeId: string) =>
      `/api/v1/attendance/employees/${employeeId}/check-in`,
    checkOut: (employeeId: string) =>
      `/api/v1/attendance/employees/${employeeId}/check-out`,
    me: '/api/v1/attendance/me',
  },
} as const

export const MANAGE_ATTENDANCE_ROLES = ['ADMINISTRADOR', 'ENCARGADO'] as const
