import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api/endpoints'
import { httpClient } from '@/lib/api/http-client'
import type { components } from '@/types/api.generated'
export type Command = components['schemas']['KitchenCommandDto']
export type CommandStatus = components['schemas']['KitchenCommandStatus']
type Page = components['schemas']['PagedResponseOfKitchenCommandDto']
type Cancel = { reason?: string | null }
export const kitchenKeys = {
  all: ['kitchen'] as const,
  lists: () => [...kitchenKeys.all, 'list'] as const,
  list: (p: { page: number; pageSize: number; status?: CommandStatus }) =>
    [...kitchenKeys.lists(), p] as const,
  details: () => [...kitchenKeys.all, 'detail'] as const,
  detail: (id: string) => [...kitchenKeys.details(), id] as const,
}
export function useCommands(
  p: { page: number; pageSize: number; status?: CommandStatus },
  realtimeHealthy = true,
) {
  return useQuery({
    queryKey: kitchenKeys.list(p),
    queryFn: () => httpClient.get<Page>(endpoints.kitchen.list(p)),
    refetchInterval: realtimeHealthy ? false : 30_000,
  })
}
function mutation<T>(fn: (value: T) => Promise<Command>) {
  const c = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      void c.invalidateQueries({ queryKey: kitchenKeys.all })
      void c.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: () => {
      void c.invalidateQueries({ queryKey: kitchenKeys.all })
      void c.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
export function useStartCommand() {
  return mutation((id: string) => httpClient.post<Command>(endpoints.kitchen.start(id)))
}
export function useReadyCommand() {
  return mutation((id: string) => httpClient.post<Command>(endpoints.kitchen.ready(id)))
}
export function useCancelCommand() {
  return mutation(({ id, request }: { id: string; request: Cancel }) =>
    httpClient.post<Command>(endpoints.kitchen.cancel(id), request),
  )
}
