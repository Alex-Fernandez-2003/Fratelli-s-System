import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { components, paths } from '@/types/api.generated'
import { endpoints } from '@/lib/api/endpoints'
import { httpClient } from '@/lib/api/http-client'

export type Balance = components['schemas']['InventoryBalanceDto']
export type Movement = components['schemas']['InventoryMovementDto']
export type ProductType = components['schemas']['ProductType']
export type MovementType = components['schemas']['InventoryMovementType']
export type ManualMovement = components['schemas']['RecordManualInventoryMovementRequest']
export type BalanceFilters = {
  page: number
  pageSize: number
  search?: string
  productType?: ProductType
}
export type MovementFilters = {
  page: number
  pageSize: number
  productId?: string
  movementType?: MovementType
  from?: string
  to?: string
}
type BalancePage =
  paths['/api/v1/inventory/balances']['get']['responses'][200]['content']['application/json']
type MovementPage =
  paths['/api/v1/inventory/movements']['get']['responses'][200]['content']['application/json']

export const inventoryKeys = {
  all: ['inventory'] as const,
  balances: (filters: BalanceFilters) => ['inventory', 'balances', filters] as const,
  movements: (filters: MovementFilters) => ['inventory', 'movements', filters] as const,
}

export const inventoryApi = {
  balances: (filters: BalanceFilters) =>
    httpClient.get<BalancePage>(endpoints.inventory.balances(filters)),
  movements: (filters: MovementFilters) =>
    httpClient.get<MovementPage>(endpoints.inventory.movements(filters)),
  create: (request: ManualMovement) =>
    httpClient.post<Movement>(endpoints.inventory.create(), request),
}

export function useBalances(filters: BalanceFilters) {
  return useQuery({
    queryKey: inventoryKeys.balances(filters),
    queryFn: () => inventoryApi.balances(filters),
    refetchInterval: 30_000,
    placeholderData: (previous) => previous,
  })
}

export function useMovements(filters: MovementFilters) {
  return useQuery({
    queryKey: inventoryKeys.movements(filters),
    queryFn: () => inventoryApi.movements(filters),
    refetchInterval: 30_000,
    placeholderData: (previous) => previous,
  })
}

export function useManualMovement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all }),
  })
}
