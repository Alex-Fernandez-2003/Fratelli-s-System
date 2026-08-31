import { useMutation, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api/endpoints'
import { httpClient } from '@/lib/api/http-client'
import { ordersKeys } from '@/features/orders/api'
import type { components, paths } from '@/types/api.generated'

type ConfirmSale = paths['/api/v1/sales']['post']['requestBody']['content']['application/json']
export type Sale = components['schemas']['SaleDto']
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
