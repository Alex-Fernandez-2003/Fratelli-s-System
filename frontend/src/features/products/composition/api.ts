import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/lib/api/http-client'
import { endpoints } from '@/lib/api/endpoints'
import type { ProductDto } from '../api'
import type { Composition, CompositionLineRequest } from './types'

// Las rutas /products/{id}/composition ya estaban definidas en
// lib/api/endpoints.ts antes de esta feature (endpoints.products.composition
// / updateComposition); acá solo se agregan los hooks que faltaban.

/** Producto padre cuya composición se está editando. */
export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ['products', productId, 'detail'],
    queryFn: () => httpClient.get<ProductDto>(endpoints.products.detail(productId as string)),
    enabled: Boolean(productId),
  })
}

export function useComposition(productId: string | undefined) {
  return useQuery({
    queryKey: ['products', productId, 'composition'],
    queryFn: () =>
      httpClient.get<Composition>(endpoints.products.composition(productId as string)),
    enabled: Boolean(productId),
  })
}

export function useUpdateComposition(productId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lines: CompositionLineRequest[]) =>
      httpClient.put<Composition>(
        endpoints.products.updateComposition(productId as string),
        lines,
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(['products', productId, 'composition'], data)
    },
  })
}
