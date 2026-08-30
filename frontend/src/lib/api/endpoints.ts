function withQuery(path: string, params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }
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
  attendance: {
    today: '/api/v1/attendance/employees/today',
    checkIn: (employeeId: string) => `/api/v1/attendance/employees/${employeeId}/check-in`,
    checkOut: (employeeId: string) => `/api/v1/attendance/employees/${employeeId}/check-out`,
    me: '/api/v1/attendance/me',
  },
  orders: {
    list: (params: { page?: number; pageSize?: number; status?: string; search?: string } = {}) =>
      withQuery('/api/v1/orders', params),
    detail: (id: string) => `/api/v1/orders/${id}`,
    create: () => '/api/v1/orders',
    assignment: (id: string) => `/api/v1/orders/${id}/assignment`,
    take: (id: string) => `/api/v1/orders/${id}/take`,
    deliver: (id: string) => `/api/v1/orders/${id}/deliver`,
    cancel: (id: string) => `/api/v1/orders/${id}/cancel`,
  },
  kitchen: {
    list: (params: { page?: number; pageSize?: number; status?: string } = {}) =>
      withQuery('/api/v1/kitchen/commands', params),
    detail: (id: string) => `/api/v1/kitchen/commands/${id}`,
    start: (id: string) => `/api/v1/kitchen/commands/${id}/start`,
    ready: (id: string) => `/api/v1/kitchen/commands/${id}/ready`,
    cancel: (id: string) => `/api/v1/kitchen/commands/${id}/cancel`,
  },
  users: {
    list: (
      params: {
        page?: number
        pageSize?: number
        search?: string
        role?: string
        active?: boolean
      } = {},
    ) => withQuery('/api/v1/users', params),
    detail: (id: string) => `/api/v1/users/${id}`,
    create: () => '/api/v1/users',
    update: (id: string) => `/api/v1/users/${id}`,
    setPassword: (id: string) => `/api/v1/users/${id}/password`,
    activate: (id: string) => `/api/v1/users/${id}/activate`,
    deactivate: (id: string) => `/api/v1/users/${id}/deactivate`,
  },
  categories: {
    list: (
      params: { page?: number; pageSize?: number; scope?: string; includeInactive?: boolean } = {},
    ) => withQuery('/api/v1/categories', params),
    detail: (id: string) => `/api/v1/categories/${id}`,
    create: () => '/api/v1/categories',
    update: (id: string) => `/api/v1/categories/${id}`,
  },
  units: {
    list: (params: { page?: number; pageSize?: number; includeInactive?: boolean } = {}) =>
      withQuery('/api/v1/units', params),
    detail: (id: string) => `/api/v1/units/${id}`,
    create: () => '/api/v1/units',
    update: (id: string) => `/api/v1/units/${id}`,
  },
  products: {
    list: (
      params: {
        page?: number
        pageSize?: number
        search?: string
        productType?: string
        categoryId?: string
        categoryScope?: string
        preparationArea?: string
        isActive?: boolean
      } = {},
    ) => withQuery('/api/v1/products', params),
    detail: (id: string) => `/api/v1/products/${id}`,
    create: () => '/api/v1/products',
    update: (id: string) => `/api/v1/products/${id}`,
    deactivate: (id: string) => `/api/v1/products/${id}`,
    composition: (id: string) => `/api/v1/products/${encodeURIComponent(id)}/composition`,
    updateComposition: (id: string) => `/api/v1/products/${encodeURIComponent(id)}/composition`,
    minimumStock: (id: string) => `/api/v1/products/${encodeURIComponent(id)}/minimum-stock`,
    updateMinimumStock: (id: string) => `/api/v1/products/${encodeURIComponent(id)}/minimum-stock`,
    productionRequirements: (id: string, quantity: number) =>
      withQuery(`/api/v1/products/${encodeURIComponent(id)}/production-requirements`, { quantity }),
  },
  productions: {
    create: () => '/api/v1/productions',
  },
  sales: {
    create: () => '/api/v1/sales',
  },
  purchases: {
    list: (params: { page: number; pageSize: number; status?: string }) =>
      withQuery('/api/v1/purchases', params),
    detail: (id: string) => `/api/v1/purchases/${encodeURIComponent(id)}`,
    create: () => '/api/v1/purchases',
    cancel: (id: string) => `/api/v1/purchases/${encodeURIComponent(id)}/cancel`,
    receive: (id: string) => `/api/v1/purchases/${encodeURIComponent(id)}/receive`,
  },
  shifts: {
    open: () => '/api/v1/shifts/open',
    current: () => '/api/v1/shifts/current',
    meCurrent: () => '/api/v1/shifts/me/current',
    assignments: (id: string) => `/api/v1/shifts/${encodeURIComponent(id)}/assignments`,
    handover: (id: string) => `/api/v1/shifts/${encodeURIComponent(id)}/handover`,
  },
  inventory: {
    balances: (
      params: {
        page?: number
        pageSize?: number
        search?: string
        productType?: string
        active?: boolean
      } = {},
    ) => withQuery('/api/v1/inventory/balances', params),
    movements: (
      params: {
        page?: number
        pageSize?: number
        productId?: string
        movementType?: string
        from?: string
        to?: string
      } = {},
    ) => withQuery('/api/v1/inventory/movements', params),
    create: () => '/api/v1/inventory/movements',
  },
  expenses: { categories: () => '/api/v1/expense-categories', create: () => '/api/v1/expenses' },
  suppliers: {
    list: '/api/v1/suppliers',
    create: '/api/v1/suppliers',
    byId: (id: string) => `/api/v1/suppliers/${id}`,
  },
} as const

export const MANAGE_ATTENDANCE_ROLES = ['ADMINISTRADOR', 'ENCARGADO'] as const