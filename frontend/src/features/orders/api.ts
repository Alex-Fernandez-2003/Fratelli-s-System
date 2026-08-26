import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api/endpoints'
import { httpClient } from '@/lib/api/http-client'
import type { components, paths } from '@/types/api.generated'

type Order = components['schemas']['OrderDto']
type OrderStatus = components['schemas']['OrderStatus']
type OrderPage = components['schemas']['PagedResponseOfOrderDto']
type CreateOrder = paths['/api/v1/orders']['post']['requestBody']['content']['application/json']
type AssignOrder =
  paths['/api/v1/orders/{id}/assignment']['put']['requestBody']['content']['application/json']
type CancelOrder =
  paths['/api/v1/orders/{id}/cancel']['post']['requestBody']['content']['application/json']

export const ordersKeys = {
  all: ['orders'] as const,
  lists: () => [...ordersKeys.all, 'list'] as const,
  list: (p: { page: number; pageSize: number; status?: OrderStatus; search?: string }) =>
    [...ordersKeys.lists(), { ...p, search: p.search?.trim() || undefined }] as const,
  details: () => [...ordersKeys.all, 'detail'] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
}
export function useOrders(
  p: {
    page: number
    pageSize: number
    status?: OrderStatus
    search?: string
  },
  realtimeHealthy = true,
) {
  return useQuery({
    queryKey: ordersKeys.list(p),
    queryFn: () => httpClient.get<OrderPage>(endpoints.orders.list(p)),
    placeholderData: (x) => x,
    refetchInterval: realtimeHealthy ? false : 30_000,
  })
}
export function useOrder(id: string, realtimeHealthy = true) {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: () => httpClient.get<Order>(endpoints.orders.detail(id)),
    enabled: !!id,
    refetchInterval: (query) =>
      realtimeHealthy || ['ENTREGADO', 'CANCELADO'].includes(query.state.data?.status ?? '')
        ? false
        : 30_000,
  })
}
function useOrderMutation<T>(fn: (v: T) => Promise<Order>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ordersKeys.all })
      void client.invalidateQueries({ queryKey: ['kitchen'] })
    },
    onError: () => {
      void client.invalidateQueries({ queryKey: ordersKeys.all })
      void client.invalidateQueries({ queryKey: ['kitchen'] })
    },
  })
}
export function useCreateOrder() {
  return useOrderMutation((request: CreateOrder) =>
    httpClient.post<Order>(endpoints.orders.create(), request),
  )
}
export function useAssignOrder() {
  return useOrderMutation(({ id, request }: { id: string; request: AssignOrder }) =>
    httpClient.put<Order>(endpoints.orders.assignment(id), request),
  )
}
export function useTakeOrder() {
  return useOrderMutation((id: string) => httpClient.post<Order>(endpoints.orders.take(id)))
}
export function useDeliverOrder() {
  return useOrderMutation((id: string) => httpClient.post<Order>(endpoints.orders.deliver(id)))
}
export function useCancelOrder() {
  return useOrderMutation(({ id, request }: { id: string; request: CancelOrder }) =>
    httpClient.post<Order>(endpoints.orders.cancel(id), request),
  )
}
export type { Order, OrderStatus, CreateOrder }
