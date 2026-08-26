function query(path: string, params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params))
    if (value !== undefined && value !== '') search.set(key, String(value))
  const value = search.toString()
  return `${path}${value ? `?${value}` : ''}`
}

export const endpoints = {
  health: '/health',
  auth: {
    login: '/api/v1/auth/login',
    refresh: '/api/v1/auth/refresh',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
  },
  orders: {
    list: (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}) =>
      query('/api/v1/orders', params),
    detail: (id: string) => `/api/v1/orders/${id}`,
    create: () => '/api/v1/orders',
    assignment: (id: string) => `/api/v1/orders/${id}/assignment`,
    take: (id: string) => `/api/v1/orders/${id}/take`,
    deliver: (id: string) => `/api/v1/orders/${id}/deliver`,
    cancel: (id: string) => `/api/v1/orders/${id}/cancel`,
  },
  kitchen: {
    list: (params: { page?: number; pageSize?: number; status?: string } = {}) =>
      query('/api/v1/kitchen/commands', params),
    detail: (id: string) => `/api/v1/kitchen/commands/${id}`,
    start: (id: string) => `/api/v1/kitchen/commands/${id}/start`,
    ready: (id: string) => `/api/v1/kitchen/commands/${id}/ready`,
    cancel: (id: string) => `/api/v1/kitchen/commands/${id}/cancel`,
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
