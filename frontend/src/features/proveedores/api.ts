import { endpoints } from '../../lib/api/endpoints'
import { httpClient } from '../../lib/api/http-client'
import type { components } from '../../types/api.generated'
import type { PagedResult, Supplier, SupplierInput, SupplierListParams } from './types'

type PagedResponseOfSupplierDto = components['schemas']['PagedResponseOfSupplierDto']

// El httpClient del proyecto es un wrapper sobre fetch (ver lib/api/http-client.ts):
// solo acepta { path, RequestInit }, no una opción `params`/`query` como Axios.
// El query string se arma a mano y se concatena a la URL.
function buildQueryString(params: SupplierListParams): string {
  const query = new URLSearchParams()
  if (params.search) query.set('search', params.search)
  if (params.isActive !== undefined) query.set('isActive', String(params.isActive))
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}

function toPagedResult(response: PagedResponseOfSupplierDto): PagedResult<Supplier> {
  return {
    items: response.items,
    page: Number(response.page),
    pageSize: Number(response.pageSize),
    totalCount: Number(response.totalCount),
    totalPages: Number(response.totalPages),
  }
}

export async function fetchSuppliers(params: SupplierListParams): Promise<PagedResult<Supplier>> {
  const response = await httpClient.get<PagedResponseOfSupplierDto>(
    `${endpoints.suppliers.list}${buildQueryString(params)}`,
  )
  return toPagedResult(response)
}

export function fetchSupplier(id: string) {
  return httpClient.get<Supplier>(endpoints.suppliers.byId(id))
}

export function createSupplier(input: SupplierInput) {
  return httpClient.post<Supplier>(endpoints.suppliers.create, input)
}

export function updateSupplier(id: string, input: SupplierInput) {
  return httpClient.put<Supplier>(endpoints.suppliers.byId(id), input)
}

// DELETE = baja lógica según la historia (isActive pasa a false),
// no borrado físico. No existe endpoint de reactivación documentado.
export function deactivateSupplier(id: string) {
  return httpClient.delete<void>(endpoints.suppliers.byId(id))
}
