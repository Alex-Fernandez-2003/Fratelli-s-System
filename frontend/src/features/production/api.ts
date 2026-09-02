import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { endpoints } from '../../lib/api/endpoints'
import { httpClient } from '../../lib/api/http-client'
import { businessDate } from '../../lib/business-time'
import type { components, paths } from '../../types/api.generated'

export type ProductDto = components['schemas']['ProductDto']
export type ProductionRequirementDto = components['schemas']['ProductionRequirementDto']
export type ProductionRequirementsDto = components['schemas']['ProductionRequirementsDto']
export type ProductionDto = components['schemas']['ProductionDto']
export type CreateProductionRequest = components['schemas']['CreateProductionRequest']
export type ProductionHistory = components['schemas']['ProductionHistoryDto']
export type ProductionHistoryDto = ProductionHistory
export type ProductionDetail = components['schemas']['ProductionDetailDto']
export type ProductionDetailDto = ProductionDetail
export type ProductionSummary = components['schemas']['ProductionSummaryDto']
export type ProductionSummaryDto = ProductionSummary
export type ProductionHistoryFilters = paths['/api/v1/productions']['get']['parameters']['query']

type ProductionHistoryPage = components['schemas']['PagedResponseOfProductionHistoryDto']
export type ProductionSummaryFilters = Omit<ProductionHistoryFilters, 'page' | 'pageSize'>
const productionRoot = ['productions'] as const

const normalizeHistoryFilters = (filters: ProductionHistoryFilters | ProductionSummaryFilters) => ({
  ...filters,
  productId: filters.productId || undefined,
  batchCode: filters.batchCode?.trim() || undefined,
  responsible: filters.responsible?.trim() || undefined,
  from: filters.from || undefined,
  to: filters.to || undefined,
})

export function createProductionHistoryFilters(date = new Date()): ProductionHistoryFilters {
  const today = businessDate(date)
  return {
    from: `${today.slice(0, 7)}-01`,
    to: today,
    page: 1,
    pageSize: 25,
  }
}

export function updateProductionHistoryFilters(
  filters: ProductionHistoryFilters,
  updates: Partial<Omit<ProductionHistoryFilters, 'page'>>,
): ProductionHistoryFilters {
  return { ...filters, ...updates, page: 1 }
}

export function setProductionHistoryPage(
  filters: ProductionHistoryFilters,
  page: number,
): ProductionHistoryFilters {
  return { ...filters, page }
}

export function useProductionHistoryFilterState(date = new Date()) {
  const [filters, setFilters] = useState(() => createProductionHistoryFilters(date))
  return {
    filters,
    updateFilters: (updates: Partial<Omit<ProductionHistoryFilters, 'page'>>) =>
      setFilters((current) => updateProductionHistoryFilters(current, updates)),
    setPage: (page: number) => setFilters((current) => setProductionHistoryPage(current, page)),
    clearFilters: () => setFilters(createProductionHistoryFilters()),
  }
}

export const productionHistoryKeys = {
  all: productionRoot,
  lists: () => [...productionRoot, 'history'] as const,
  list: (filters: ProductionHistoryFilters) =>
    [...productionHistoryKeys.lists(), normalizeHistoryFilters(filters)] as const,
  summary: (filters: ProductionSummaryFilters) =>
    [...productionRoot, 'summary', normalizeHistoryFilters(filters)] as const,
  detail: (id: string | undefined) => [...productionRoot, 'detail', id] as const,
}

function productionHistoryPath(filters: ProductionHistoryFilters) {
  const values = normalizeHistoryFilters(filters)
  return endpoints.productions.list({
    page: Number(filters.page),
    pageSize: Number(filters.pageSize),
    productId: values.productId,
    batchCode: values.batchCode,
    status: values.status,
    responsible: values.responsible,
    from: values.from,
    to: values.to,
  })
}

function productionSummaryPath(filters: ProductionSummaryFilters) {
  const values = normalizeHistoryFilters({ ...filters, page: 1, pageSize: 25 })
  return endpoints.productions.summary({
    productId: values.productId,
    batchCode: values.batchCode,
    status: values.status,
    responsible: values.responsible,
    from: values.from,
    to: values.to,
  })
}

export const fetchProductionHistory = (filters: ProductionHistoryFilters) =>
  httpClient.get<ProductionHistoryPage>(productionHistoryPath(filters))
export const fetchProductionSummary = (filters: ProductionSummaryFilters) =>
  httpClient.get<ProductionSummary>(productionSummaryPath(filters))
export const fetchProductionDetail = (id: string) =>
  httpClient.get<ProductionDetail>(endpoints.productions.detail(id))

export const productionApi = {
  listProducts: (
    params: {
      page?: number
      pageSize?: number
      search?: string
      productType?: string
      isActive?: boolean
    } = {},
  ) =>
    httpClient.get<{
      items: ProductDto[]
      page: number
      pageSize: number
      totalCount: number
      totalPages: number
    }>(endpoints.products.list(params)),
  listHistory: fetchProductionHistory,
  getSummary: fetchProductionSummary,
  getDetail: fetchProductionDetail,
  getRequirements: (productId: string, quantity: number) =>
    httpClient.get<ProductionRequirementsDto>(
      endpoints.products.productionRequirements(productId, quantity),
    ),
  create: (request: CreateProductionRequest) =>
    httpClient.post<ProductionDto>(endpoints.productions.create(), request),
}

export function useProductionPreparations() {
  return useQuery({
    queryKey: [...productionRoot, 'preparations'],
    queryFn: () =>
      productionApi.listProducts({
        page: 1,
        pageSize: 100,
        productType: 'PREPARATION',
        isActive: true,
      }),
    staleTime: 5 * 60_000,
  })
}

export function useProductionHistory(filters: ProductionHistoryFilters) {
  return useQuery({
    queryKey: productionHistoryKeys.list(filters),
    queryFn: () => productionApi.listHistory(filters),
    placeholderData: (previous) => previous,
  })
}

export function useProductionSummary(filters: ProductionSummaryFilters) {
  return useQuery({
    queryKey: productionHistoryKeys.summary(filters),
    queryFn: () => productionApi.getSummary(filters),
  })
}

export function productionDetailQueryOptions(id: string | undefined) {
  return {
    queryKey: productionHistoryKeys.detail(id),
    queryFn: () => productionApi.getDetail(id ?? ''),
    enabled: Boolean(id),
  }
}

export function useProductionDetail(id: string | undefined) {
  return useQuery(productionDetailQueryOptions(id))
}
