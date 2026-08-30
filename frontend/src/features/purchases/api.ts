import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/lib/api/http-client'
import { endpoints } from '@/lib/api/endpoints'
import type { paths } from '@/types/api.generated'
import type { Supplier as SupplierDto } from '@/features/proveedores/types'

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

export function usePurchasesList(params: { page: number; pageSize: number; status?: PurchaseStatus }) {
  return useQuery({
    queryKey: ['purchases', 'list', params],
    queryFn: () =>
      httpClient.get<paths['/api/v1/purchases']['get']['responses'][200]['content']['application/json']>(
        endpoints.purchases.list(params),
      ),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  })
}

export function usePurchaseDetail(id: string) {
  return useQuery({
    queryKey: ['purchases', 'detail', id],
    queryFn: () =>
      httpClient.get<paths['/api/v1/purchases/{id}']['get']['responses'][200]['content']['application/json']>(
        endpoints.purchases.detail(id),
      ),
    enabled: !!id,
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreatePurchaseRequest) =>
      httpClient.post<paths['/api/v1/purchases']['post']['responses'][201]['content']['application/json']>(
        endpoints.purchases.create(),
        request,
      ),
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
      httpClient.get<paths['/api/v1/products']['get']['responses'][200]['content']['application/json']>(
        endpoints.products.list({ pageSize: 100, isActive: true }),
      ),
    staleTime: 5 * 60_000,
  })
}

export function useUnitsForPurchase() {
  return useQuery({
    queryKey: ['units', 'list', { forPurchase: true }],
    queryFn: () =>
      httpClient.get<paths['/api/v1/units']['get']['responses'][200]['content']['application/json']>(
        endpoints.units.list({ pageSize: 100, includeInactive: false }),
      ),
    staleTime: 5 * 60_000,
  })
}
