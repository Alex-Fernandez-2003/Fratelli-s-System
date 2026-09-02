import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { shiftKeys } from '@/features/shifts/api'
import { endpoints } from '@/lib/api/endpoints'
import { httpClient, HttpError } from '@/lib/api/http-client'
import { businessDate } from '@/lib/business-time'
import type { components, paths } from '@/types/api.generated'

export type CashPreviewDto = components['schemas']['CashPreviewDto']
export type CashClosingDto = components['schemas']['CashClosingDto']
export type CloseCashRequest = components['schemas']['CloseCashRequest']
export type CashClosingHistoryPage = components['schemas']['PagedResponseOfCashClosingDto']
export type CashClosingHistoryFilters = paths['/api/v1/cash/closings']['get']['parameters']['query']

export const CASH_HISTORY_READ_ROLES = ['ADMINISTRADOR', 'ENCARGADO', 'CONTADORA'] as const

const cashHistoryPageSize = 25

const normalizeCashClosingHistoryFilters = (filters: CashClosingHistoryFilters) => ({
  page: Number(filters.page ?? 1),
  pageSize: Number(filters.pageSize ?? cashHistoryPageSize),
  from: filters.from || undefined,
  to: filters.to || undefined,
})

export function createCashClosingHistoryFilters(date = new Date()): CashClosingHistoryFilters {
  const today = businessDate(date)
  return {
    from: `${today.slice(0, 7)}-01`,
    to: today,
    page: 1,
    pageSize: cashHistoryPageSize,
  }
}

export function updateCashClosingHistoryFilters(
  filters: CashClosingHistoryFilters,
  updates: Partial<Omit<CashClosingHistoryFilters, 'page' | 'pageSize'>>,
): CashClosingHistoryFilters {
  return { ...filters, ...updates, page: 1 }
}

export function setCashClosingHistoryPage(
  filters: CashClosingHistoryFilters,
  page: number,
): CashClosingHistoryFilters {
  return { ...filters, page }
}

export function useCashClosingHistoryFilterState(date = new Date()) {
  const [filters, setFilters] = useState(() => createCashClosingHistoryFilters(date))
  return {
    filters,
    updateFilters: (updates: Partial<Omit<CashClosingHistoryFilters, 'page' | 'pageSize'>>) =>
      setFilters((current) => updateCashClosingHistoryFilters(current, updates)),
    setPage: (page: number) => setFilters((current) => setCashClosingHistoryPage(current, page)),
    clearFilters: () => setFilters(createCashClosingHistoryFilters()),
  }
}

export const cashKeys = {
  all: ['cash'] as const,
  preview: () => [...cashKeys.all, 'preview'] as const,
  closings: (filters?: CashClosingHistoryFilters) =>
    filters
      ? ([...cashKeys.all, 'closings', normalizeCashClosingHistoryFilters(filters)] as const)
      : ([...cashKeys.all, 'closings'] as const),
  closing: (id: string | undefined) => [...cashKeys.all, 'closing', id] as const,
}

export const cashApi = {
  preview: () => httpClient.get<CashPreviewDto>(endpoints.cash.preview()),
  close: (request: CloseCashRequest) =>
    httpClient.post<CashClosingDto>(endpoints.cash.close(), request),
  closings: (filters: CashClosingHistoryFilters) => {
    const values = normalizeCashClosingHistoryFilters(filters)
    return httpClient.get<CashClosingHistoryPage>(
      endpoints.cash.closings({
        page: values.page,
        pageSize: values.pageSize,
        from: values.from,
        to: values.to,
      }),
    )
  },
  closing: (id: string) => httpClient.get<CashClosingDto>(endpoints.cash.closing(id)),
}

export function useCashPreview() {
  return useQuery({
    queryKey: cashKeys.preview(),
    queryFn: cashApi.preview,
    staleTime: 15_000,
    retry: (failureCount, error) =>
      !(error instanceof HttpError && error.status === 404) && failureCount < 2,
  })
}

export function useCashClosingHistory(filters: CashClosingHistoryFilters) {
  return useQuery({
    queryKey: cashKeys.closings(filters),
    queryFn: () => cashApi.closings(filters),
    placeholderData: (previous) => previous,
  })
}

export function cashClosingDetailQueryOptions(id: string | undefined) {
  return {
    queryKey: cashKeys.closing(id),
    queryFn: () => cashApi.closing(id ?? ''),
    enabled: Boolean(id),
  }
}

export function useCashClosingDetail(id: string | undefined) {
  return useQuery(cashClosingDetailQueryOptions(id))
}

export function useCloseCash() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cashApi.close,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cashKeys.preview() })
      void queryClient.invalidateQueries({ queryKey: cashKeys.closings() })
      void queryClient.invalidateQueries({ queryKey: shiftKeys.context })
      void queryClient.invalidateQueries({ queryKey: shiftKeys.mine })
    },
    onError: (error: unknown) => {
      if (error instanceof HttpError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: cashKeys.preview() })
        void queryClient.invalidateQueries({ queryKey: cashKeys.closings() })
        void queryClient.invalidateQueries({ queryKey: shiftKeys.context })
        void queryClient.invalidateQueries({ queryKey: shiftKeys.mine })
      }
    },
  })
}

export function cashErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 400) return error.problem.detail ?? 'Revisá los datos ingresados.'
    if (error.status === 403) return 'No tenés permisos para cerrar la caja.'
    if (error.status === 404) return 'No hay una caja abierta disponible para cerrar.'
    if (error.status === 409)
      return error.problem.detail ?? 'La caja ya fue cerrada. Actualizá el estado operativo.'
  }
  return 'No se pudo completar la operación. Intentá nuevamente.'
}

export function cashHistoryErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 400) return error.problem.detail ?? 'Revisá el período seleccionado.'
    if (error.status === 403) return 'No tenés permisos para consultar los cierres.'
    if (error.status === 404) return 'El cierre solicitado ya no está disponible.'
  }
  return 'No se pudo cargar el historial de cierres.'
}
