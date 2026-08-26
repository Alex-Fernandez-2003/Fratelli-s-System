export const endpoints = {
  health: '/health',
  auth: {
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
  },
  users: {
    list: (params?: {
      page?: number
      pageSize?: number
      search?: string
      role?: string
      active?: boolean
    }) => {
      const query = new URLSearchParams()
      if (params?.page) query.set('page', String(params.page))
      if (params?.pageSize) query.set('pageSize', String(params.pageSize))
      if (params?.search) query.set('search', params.search)
      if (params?.role) query.set('role', params.role)
      if (params?.active !== undefined) query.set('active', String(params.active))
      const qs = query.toString()
      return `/api/v1/users${qs ? `?${qs}` : ''}`
    },
    detail: (id: string) => `/api/v1/users/${id}`,
    create: () => '/api/v1/users',
    update: (id: string) => `/api/v1/users/${id}`,
    setPassword: (id: string) => `/api/v1/users/${id}/password`,
    activate: (id: string) => `/api/v1/users/${id}/activate`,
    deactivate: (id: string) => `/api/v1/users/${id}/deactivate`,
  },
} as const
