import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { httpClient } from '@/lib/api/http-client'
import { endpoints } from '@/lib/api/endpoints'
import { businessDate } from '@/lib/business-time'
import type { components, paths } from '@/types/api.generated'
import type { Supplier as SupplierDto } from '@/features/proveedores/types'

/**
 * Roles según el handoff real de Sprint 2 y la política del backend
 * (Program.cs): lectura usa SupplierRead (incluye CONTADORA); escritura
 * (crear/cancelar/recibir) usa OperationsPurchase, sin CONTADORA.
 */
export const PURCHASE_READ_ROLES = ['ADMINISTRADOR', 'ENCARGADO', 'COCINA', 'CONTADORA'] as const
export const PURCHASE_WRITE_ROLES = ['ADMINISTRADOR', 'ENCARGADO', 'COCINA'] as const

export type PurchaseDto =
  paths['/api/v1/purchases']['get']['responses'][200]['content']['application/json']['items'][number]
export type PurchaseStatus = PurchaseDto['status']
export type CreatePurchaseRequest =
  paths['/api/v1/purchases']['post']['requestBody']['content']['application/json']
export type PurchaseLineRequest = CreatePurchaseRequest['lines'][number]
export type CancelPurchaseRequest =
  paths['/api/v1/purchases/{id}/cancel']['post']['requestBody']['content']['application/json']
export type ReceivePurchaseRequest =
  paths['/api/v1/purchases/{id}/receive']['post']['requestBody']['content']['application/json']
export type ReceiptLineRequest = ReceivePurchaseRequest['lines'][number]

export type PurchaseHistoryDto = components['schemas']['PurchaseHistoryDto']
export type PurchaseDetailDto = components['schemas']['PurchaseDetailDto']
export type PurchaseHistoryFilters =
  paths['/api/v1/purchases/history']['get']['parameters']['query']
type PurchaseHistoryPage = components['schemas']['PagedResponseOfPurchaseHistoryDto']

const purchaseRoot = ['purchases'] as const

const normalizeHistoryFilters = (filters: PurchaseHistoryFilters) => ({
  ...filters,
  status: filters.status || undefined,
  supplierId: filters.supplierId || undefined,
  purchaseArea: filters.purchaseArea || undefined,
  from: filters.from || undefined,
  to: filters.to || undefined,
})

function dateDaysBefore(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`)
  value.setUTCDate(value.getUTCDate() - days)
  return value.toISOString().slice(0, 10)
}

export function createPurchaseHistoryFilters(date = new Date()): PurchaseHistoryFilters {
  const today = businessDate(date)
  return { from: dateDaysBefore(today, 29), to: today, page: 1, pageSize: 25 }
}

export function updatePurchaseHistoryFilters(
  filters: PurchaseHistoryFilters,
  updates: Partial<Omit<PurchaseHistoryFilters, 'page' | 'pageSize'>>,
): PurchaseHistoryFilters {
  return { ...filters, ...updates, page: 1 }
}

export function setPurchaseHistoryPage(
  filters: PurchaseHistoryFilters,
  page: number,
): PurchaseHistoryFilters {
  return { ...filters, page }
}

export function usePurchaseHistoryFilterState(date = new Date()) {
  const [filters, setFilters] = useState(() => createPurchaseHistoryFilters(date))
  return {
    filters,
    updateFilters: (updates: Partial<Omit<PurchaseHistoryFilters, 'page' | 'pageSize'>>) =>
      setFilters((current) => updatePurchaseHistoryFilters(current, updates)),
    setPage: (page: number) => setFilters((current) => setPurchaseHistoryPage(current, page)),
    clearFilters: () => setFilters(createPurchaseHistoryFilters()),
  }
}

export const purchaseHistoryKeys = {
  all: purchaseRoot,
  lists: () => [...purchaseRoot, 'history'] as const,
  list: (filters: PurchaseHistoryFilters) =>
    [...purchaseHistoryKeys.lists(), normalizeHistoryFilters(filters)] as const,
  detail: (id: string | undefined) => [...purchaseRoot, 'history', 'detail', id] as const,
}

export function purchaseHistoryScope(roles: readonly string[]): 'broad' | 'cocina' {
  return roles.some((role) => ['ADMINISTRADOR', 'ENCARGADO', 'CONTADORA'].includes(role))
    ? 'broad'
    : 'cocina'
}

function purchaseHistoryPath(filters: PurchaseHistoryFilters) {
  const values = normalizeHistoryFilters(filters)
  return endpoints.purchases.list({
    page: Number(filters.page),
    pageSize: Number(filters.pageSize),
    status: values.status,
    supplierId: values.supplierId,
    purchaseArea: values.purchaseArea,
    from: values.from,
    to: values.to,
  })
}

export const fetchPurchaseHistory = (filters: PurchaseHistoryFilters) =>
  httpClient.get<PurchaseHistoryPage>(purchaseHistoryPath(filters))

export const fetchPurchaseDetail = (id: string) =>
  httpClient.get<PurchaseDetailDto>(endpoints.purchases.detail(id))

export function usePurchasesList(params: PurchaseHistoryFilters) {
  return useQuery({
    queryKey: purchaseHistoryKeys.list(params),
    queryFn: () => fetchPurchaseHistory(params),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  })
}

/** History detail is intentionally separate from the operation detail used by
 * the existing receive flow. The latter retains its original read model. */
export function usePurchaseDetail(id: string) {
  return useQuery({
    queryKey: purchaseHistoryKeys.detail(id),
    queryFn: () => fetchPurchaseDetail(id),
    enabled: Boolean(id),
  })
}

export function usePurchaseOperationDetail(id: string) {
  return useQuery({
    queryKey: [...purchaseRoot, 'operation-detail', id],
    queryFn: () =>
      httpClient.get<
        paths['/api/v1/purchases/{id}']['get']['responses'][200]['content']['application/json']
      >(endpoints.purchases.operationDetail(id)),
    enabled: Boolean(id),
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreatePurchaseRequest) =>
      httpClient.post<
        paths['/api/v1/purchases']['post']['responses'][201]['content']['application/json']
      >(endpoints.purchases.create(), request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: purchaseHistoryKeys.lists() })
    },
  })
}

export function useCancelPurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: CancelPurchaseRequest }) =>
      httpClient.post<
        paths['/api/v1/purchases/{id}/cancel']['post']['responses'][200]['content']['application/json']
      >(endpoints.purchases.cancel(id), request),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: purchaseHistoryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: purchaseHistoryKeys.detail(id) })
    },
  })
}

/**
 * HU-018 — Recibir compra. Solo compras PENDIENTE aceptan recepción; el
 * backend responde 409 PURCHASE_ALREADY_RECEIVED en cualquier otro estado.
 */
export function useReceivePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ReceivePurchaseRequest }) =>
      httpClient.post<
        paths['/api/v1/purchases/{id}/receive']['post']['responses'][200]['content']['application/json']
      >(endpoints.purchases.receive(id), request),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: purchaseHistoryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: purchaseHistoryKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

/**
 * Referencias auxiliares: el historial ya trae supplierName, pero las formas
 * existentes de crear/recibir compra todavía necesitan el catálogo completo.
 */
export function useSuppliersForPurchase() {
  return useQuery({
    queryKey: ['suppliers', 'list', { forPurchase: true }],
    queryFn: () =>
      httpClient.get<{ items: SupplierDto[] }>(
        `${endpoints.suppliers.list}?pageSize=100&isActive=true`,
      ),
    staleTime: 5 * 60_000,
  })
}

export function useProductsForPurchase() {
  return useQuery({
    queryKey: ['products', 'list', { forPurchase: true }],
    queryFn: () =>
      httpClient.get<
        paths['/api/v1/products']['get']['responses'][200]['content']['application/json']
      >(endpoints.products.list({ pageSize: 100, isActive: true })),
    staleTime: 5 * 60_000,
  })
}

export function useUnitsForPurchase() {
  return useQuery({
    queryKey: ['units', 'list', { forPurchase: true }],
    queryFn: () =>
      httpClient.get<
        paths['/api/v1/units']['get']['responses'][200]['content']['application/json']
      >(endpoints.units.list({ pageSize: 100, includeInactive: false })),
    staleTime: 5 * 60_000,
  })
}
