// Tipos del módulo de proveedores.
// Supplier / SupplierInput se derivan de src/types/api.generated.ts, que ya
// expone estos shapes generados desde el OpenAPI del backend. No se
// duplican aquí para no tener dos fuentes de verdad que se desincronicen.
import type { components } from '../../types/api.generated'

export type Supplier = components['schemas']['SupplierDto']
export type SupplierInput = components['schemas']['SupplierRequest']

export interface SupplierListParams {
  search?: string
  // El backend solo soporta filtrar por activos o por inactivos.
  // No existe un valor de isActive que traiga ambos a la vez.
  isActive?: boolean
  page?: number
  pageSize?: number
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

// Roles exactos del backend (strings tal cual los usa la autorización).
export const SUPPLIER_READ_ROLES = ['ADMINISTRADOR', 'ENCARGADO', 'COCINA', 'CONTADORA'] as const
export const SUPPLIER_WRITE_ROLES = ['ADMINISTRADOR', 'ENCARGADO'] as const
