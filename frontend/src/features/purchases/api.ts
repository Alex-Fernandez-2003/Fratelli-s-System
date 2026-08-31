import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/lib/api/http-client'
import { endpoints } from '@/lib/api/endpoints'
import type { paths } from '@/types/api.generated'
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

export function usePurchasesList(params: {
  page: number
  pageSize: number
  status?: PurchaseStatus
}) {
  return useQuery({
    queryKey: ['purchases', 'list', params],
    queryFn: () =>
      httpClient.get<
        paths['/api/v1/purchases']['get']['responses'][200]['content']['application/json']
      >(endpoints.purchases.list(params)),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  })
}

export function usePurchaseDetail(id: string) {
  return useQuery({
    queryKey: ['purchases', 'detail', id],
    queryFn: () =>
      httpClient.get<
        paths['/api/v1/purchases/{id}']['get']['responses'][200]['content']['application/json']
      >(endpoints.purchases.detail(id)),
    enabled: !!id,
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreatePurchaseRequest) =>
      httpClient.post<
        paths['/api/v1/purchases']['post']['responses'][201]['content']['application/json']
      >(endpoints.purchases.create(), request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchases'] }),
  })
}

export function useCancelPurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: CancelPurchaseRequest }) =>
      httpClient.post<
        paths['/api/v1/purchases/{id}/cancel']['post']['responses'][200]['content']['application/json']
      >(endpoints.purchases.cancel(id), request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchases'] }),
  })
}

/**
 * HU-018 — Recibir compra. Solo compras PENDIENTE aceptan recepción; el
 * backend responde 409 PURCHASE_ALREADY_RECEIVED en cualquier otro estado
 * (RECIBIDA o CANCELADA, sin distinción). "No partial receipt" del handoff
 * significa: todas las PurchaseItem deben enviarse exactamente una vez
 * (una línea por cada una), cada receivedQuantity > 0 — no que deba
 * coincidir con orderedQuantity; sí puede recibirse menos de lo pedido.
 * Al confirmar, el inventario se incrementa, por eso también se invalida
 * la query de inventario.
 */
export function useReceivePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ReceivePurchaseRequest }) =>
      httpClient.post<
        paths['/api/v1/purchases/{id}/receive']['post']['responses'][200]['content']['application/json']
      >(endpoints.purchases.receive(id), request),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] })
      queryClient.invalidateQueries({ queryKey: ['purchases', 'detail', id] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    },
  })
}

/**
 * Referencias auxiliares: PurchaseDto no trae nombres, solo IDs.
 *
 * `endpoints.suppliers.list` es un string estático (no una función, a
 * diferencia de products/units), así que la query se arma a mano acá.
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
