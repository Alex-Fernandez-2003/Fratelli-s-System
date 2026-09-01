import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { httpClient } from '@/lib/api/http-client'
import type { components, paths } from '@/types/api.generated'

export type Customer = components['schemas']['CustomerDto']
export type CustomerRequest =
  paths['/api/v1/customers']['post']['requestBody']['content']['application/json']
export type CustomerListParams = paths['/api/v1/customers']['get']['parameters']['query']
type CustomerPage = components['schemas']['PagedResponseOfCustomerDto']

const root = ['customers'] as const
const normalized = (params: CustomerListParams) => ({
  ...params,
  search: params.search?.trim() || undefined,
})
export const customerKeys = {
  all: root,
  lists: () => [...root, 'list'] as const,
  list: (params: CustomerListParams) => [...customerKeys.lists(), normalized(params)] as const,
}

function customerPath(params: CustomerListParams) {
  const query = new URLSearchParams()
  const values = normalized(params)
  query.set('page', String(values.page))
  query.set('pageSize', String(values.pageSize))
  if (values.search) query.set('search', values.search)
  if (values.isActive !== undefined) query.set('isActive', String(values.isActive))
  return `/api/v1/customers?${query}`
}

export function fetchCustomers(params: CustomerListParams) {
  return httpClient.get<CustomerPage>(customerPath(params))
}
export const createCustomer = (request: CustomerRequest) =>
  httpClient.post<Customer>('/api/v1/customers', request)
export const updateCustomer = (id: string, request: CustomerRequest) =>
  httpClient.put<Customer>(`/api/v1/customers/${encodeURIComponent(id)}`, request)
export const activateCustomer = (id: string) =>
  httpClient.post<void>(`/api/v1/customers/${encodeURIComponent(id)}/activate`)
export const deactivateCustomer = (id: string) =>
  httpClient.post<void>(`/api/v1/customers/${encodeURIComponent(id)}/deactivate`)

export function invalidateCustomers(client: QueryClient) {
  return client.invalidateQueries({ queryKey: customerKeys.all })
}
export function useCustomers(params: CustomerListParams) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => fetchCustomers(params),
    placeholderData: (x) => x,
  })
}
function useCustomerMutation<T>(mutationFn: (value: T) => Promise<unknown>) {
  const client = useQueryClient()
  return useMutation({ mutationFn, onSuccess: () => void invalidateCustomers(client) })
}
export const useCreateCustomer = () => useCustomerMutation(createCustomer)
export const useUpdateCustomer = () =>
  useCustomerMutation(({ id, request }: { id: string; request: CustomerRequest }) =>
    updateCustomer(id, request),
  )
export const useActivateCustomer = () => useCustomerMutation(activateCustomer)
export const useDeactivateCustomer = () => useCustomerMutation(deactivateCustomer)
