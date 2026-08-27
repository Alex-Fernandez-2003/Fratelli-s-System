import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/lib/api/http-client'
import { endpoints } from '@/lib/api/endpoints'
import type { paths } from '@/types/api.generated'

export type ProductDto =
  paths['/api/v1/products']['get']['responses'][200]['content']['application/json']['items'][number]
export type ProductRequest =
  paths['/api/v1/products']['post']['requestBody']['content']['application/json']
export type CategoryDto =
  paths['/api/v1/categories']['get']['responses'][200]['content']['application/json']['items'][number]
export type UnitDto =
  paths['/api/v1/units']['get']['responses'][200]['content']['application/json']['items'][number]

export function useProductsList(params?: {
  page?: number
  pageSize?: number
  search?: string
  productType?: string
  categoryId?: string
  categoryScope?: string
  preparationArea?: string
  isActive?: boolean
}) {
  return useQuery({
    queryKey: ['products', 'list', params],
    queryFn: () =>
      httpClient.get<
        paths['/api/v1/products']['get']['responses'][200]['content']['application/json']
      >(endpoints.products.list(params)),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  })
}

export function useCategoriesList(params?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: ['categories', 'list', params],
    queryFn: () =>
      httpClient.get<
        paths['/api/v1/categories']['get']['responses'][200]['content']['application/json']
      >(endpoints.categories.list({ pageSize: 100, ...params })),
    staleTime: 5 * 60_000,
  })
}

export function useUnitsList(params?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: ['units', 'list', params],
    queryFn: () =>
      httpClient.get<
        paths['/api/v1/units']['get']['responses'][200]['content']['application/json']
      >(endpoints.units.list({ pageSize: 100, ...params })),
    staleTime: 5 * 60_000,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: ProductRequest) =>
      httpClient.post<
        paths['/api/v1/products']['post']['responses'][201]['content']['application/json']
      >(endpoints.products.create(), request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ProductRequest }) =>
      httpClient.put<
        paths['/api/v1/products/{id}']['put']['responses'][200]['content']['application/json']
      >(endpoints.products.update(id), request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

/**
 * IMPORTANTE: `DELETE /api/v1/products/{id}` es el único mecanismo disponible
 * para cambiar el estado de un producto. Según el modelo de datos general
 * del proyecto los catálogos se desactivan (no se borran físicamente), pero
 * a diferencia de `users` (que tiene /activate y /deactivate separados),
 * products NO expone un endpoint para reactivar. Esto significa que, con el
 * contrato actual, desactivar un producto es una acción sin vuelta atrás
 * desde la UI. Pendiente de confirmar con el equipo de backend si:
 *   a) falta agregar un endpoint de reactivación, o
 *   b) se reactiva editando el producto por otro medio no evidente aún.
 * No se debe asumir un comportamiento no confirmado; mientras tanto la UI
 * solo ofrece "Desactivar" y dicha acción se comunica como irreversible.
 */
export function useDeactivateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => httpClient.delete<void>(endpoints.products.deactivate(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
