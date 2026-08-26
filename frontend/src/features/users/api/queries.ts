import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/lib/api/http-client'
import { endpoints } from '@/lib/api/endpoints'
import type { paths } from '@/types/api.generated'

export function useUsersList(params?: {
  page?: number
  pageSize?: number
  search?: string
  role?: string
  active?: boolean
}) {
  return useQuery({
    queryKey: ['users', 'list', params],
    queryFn: async () => {
      const path = endpoints.users.list(params)
      const response =
        await httpClient.get<
          paths['/api/v1/users']['get']['responses'][200]['content']['application/json']
        >(path)
      return response
    },
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  })
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: async () => {
      const response = await httpClient.get<
        paths['/api/v1/users/{id}']['get']['responses'][200]['content']['application/json']
      >(endpoints.users.detail(id))
      return response
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      request: paths['/api/v1/users']['post']['requestBody']['content']['application/json'],
    ) => {
      const response = await httpClient.post<
        paths['/api/v1/users']['post']['responses'][201]['content']['application/json']
      >(endpoints.users.create(), request)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string
      request: paths['/api/v1/users/{id}']['put']['requestBody']['content']['application/json']
    }) => {
      const response = await httpClient.put<
        paths['/api/v1/users/{id}']['put']['responses'][200]['content']['application/json']
      >(endpoints.users.update(id), request)
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useSetUserPassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      request,
    }: {
      id: string
      request: paths['/api/v1/users/{id}/password']['post']['requestBody']['content']['application/json']
    }) => {
      await httpClient.post(endpoints.users.setPassword(id), request)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useActivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.post(endpoints.users.activate(id))
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', id] })
    },
  })
}

export function useDeactivateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.post(endpoints.users.deactivate(id))
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['users', 'detail', id] })
    },
  })
}
