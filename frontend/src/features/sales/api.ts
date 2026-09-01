import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { endpoints } from '@/lib/api/endpoints'
import { httpClient } from '@/lib/api/http-client'
import { businessDate } from '@/lib/business-time'
import { ordersKeys } from '@/features/orders/api'
import type { components, paths } from '@/types/api.generated'

type ConfirmSale = paths['/api/v1/sales']['post']['requestBody']['content']['application/json']
export type Sale = components['schemas']['SaleDto']
type SalesHistoryPage = components['schemas']['PagedResponseOfSalesHistoryDto']
export type SalesHistoryDetail = components['schemas']['SalesDetailDto']
export type SalesHistoryFilters = paths['/api/v1/sales']['get']['parameters']['query']

const salesRoot = ['sales'] as const
const broadSalesHistoryRoles = ['ADMINISTRADOR', 'ENCARGADO', 'CONTADORA'] as const

const normalizeSalesHistoryFilters = (filters: SalesHistoryFilters) => ({
  ...filters,
  customerSearch: filters.customerSearch?.trim() || undefined,
  from: filters.from || undefined,
  to: filters.to || undefined,
  shiftId: filters.shiftId || undefined,
})

export function createSalesHistoryFilters(date = new Date()): SalesHistoryFilters {
  const today = businessDate(date)
  return { from: today, to: today, page: 1, pageSize: 25 }
}

export function updateSalesHistoryFilters(
  filters: SalesHistoryFilters,
  updates: Partial<Omit<SalesHistoryFilters, 'page'>>,
): SalesHistoryFilters {
  return { ...filters, ...updates, page: 1 }
}

export function setSalesHistoryPage(
  filters: SalesHistoryFilters,
  page: number,
): SalesHistoryFilters {
  return { ...filters, page }
}

export function useSalesHistoryFilterState(date = new Date()) {
  const [filters, setFilters] = useState(() => createSalesHistoryFilters(date))
  return {
    filters,
    updateFilters: (updates: Partial<Omit<SalesHistoryFilters, 'page'>>) =>
      setFilters((current) => updateSalesHistoryFilters(current, updates)),
    setPage: (page: number) => setFilters((current) => setSalesHistoryPage(current, page)),
  }
}

export const salesHistoryKeys = {
  all: salesRoot,
  lists: () => [...salesRoot, 'history'] as const,
  list: (filters: SalesHistoryFilters) =>
    [...salesHistoryKeys.lists(), normalizeSalesHistoryFilters(filters)] as const,
  detail: (id: string | undefined) => [...salesRoot, 'detail', id] as const,
}

function salesHistoryPath(filters: SalesHistoryFilters) {
  const query = new URLSearchParams()
  const values = normalizeSalesHistoryFilters(filters)
  query.set('page', String(values.page))
  query.set('pageSize', String(values.pageSize))
  if (values.from) query.set('from', values.from)
  if (values.to) query.set('to', values.to)
  if (values.shiftId) query.set('shiftId', values.shiftId)
  if (values.salesChannel) query.set('salesChannel', values.salesChannel)
  if (values.paymentMethod) query.set('paymentMethod', values.paymentMethod)
  if (values.customerSearch) query.set('customerSearch', values.customerSearch)
  return `/api/v1/sales?${query}`
}

export const fetchSalesHistory = (filters: SalesHistoryFilters) =>
  httpClient.get<SalesHistoryPage>(salesHistoryPath(filters))
export const fetchSaleDetail = (id: string) =>
  httpClient.get<SalesHistoryDetail>(`/api/v1/sales/${encodeURIComponent(id)}`)

export function salesDetailQueryOptions(id: string | undefined) {
  return {
    queryKey: salesHistoryKeys.detail(id),
    queryFn: () => fetchSaleDetail(id ?? ''),
    enabled: Boolean(id),
  }
}

export function useSalesHistory(filters: SalesHistoryFilters) {
  return useQuery({
    queryKey: salesHistoryKeys.list(filters),
    queryFn: () => fetchSalesHistory(filters),
    placeholderData: (previous) => previous,
  })
}

export function useSaleDetail(id: string | undefined) {
  return useQuery(salesDetailQueryOptions(id))
}

export function salesHistoryScope(roles: readonly string[]): 'broad' | 'assigned-shift' | 'none' {
  if (roles.some((role) => (broadSalesHistoryRoles as readonly string[]).includes(role)))
    return 'broad'
  return roles.includes('MESERO') ? 'assigned-shift' : 'none'
}

export function useConfirmSale() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (request: ConfirmSale) => httpClient.post<Sale>(endpoints.sales.create(), request),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ordersKeys.all })
      void client.invalidateQueries({ queryKey: ['inventory'] })
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: ordersKeys.all })
    },
  })
}
