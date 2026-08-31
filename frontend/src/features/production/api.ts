import { httpClient } from '../../lib/api/http-client'
import { endpoints } from '../../lib/api/endpoints'
import type { components } from '../../types/api.generated'

export type ProductDto = components['schemas']['ProductDto']
export type ProductionRequirementDto = components['schemas']['ProductionRequirementDto']
export type ProductionRequirementsDto = components['schemas']['ProductionRequirementsDto']
export type ProductionDto = components['schemas']['ProductionDto']
export type CreateProductionRequest = components['schemas']['CreateProductionRequest']

export const productionApi = {
  listProducts: (params: { page?: number; pageSize?: number; search?: string; productType?: string; isActive?: boolean } = {}) =>
    httpClient.get<{ items: ProductDto[]; page: number; pageSize: number; totalCount: number; totalPages: number }>(
      endpoints.products.list(params),
    ),

  getRequirements: (productId: string, quantity: number) =>
    httpClient.get<ProductionRequirementsDto>(
      endpoints.products.productionRequirements(productId, quantity),
    ),

  create: (request: CreateProductionRequest) =>
    httpClient.post<ProductionDto>(endpoints.productions.create(), request),
}
