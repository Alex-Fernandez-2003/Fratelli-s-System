import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api/endpoints'
import { httpClient, HttpError } from '@/lib/api/http-client'
import type { components } from '@/types/api.generated'
import { shiftKeys } from '@/features/shifts/api'

export type CashPreviewDto = components['schemas']['CashPreviewDto']
export type CashClosingDto = components['schemas']['CashClosingDto']
export type CloseCashRequest = components['schemas']['CloseCashRequest']

export const cashKeys = {
  all: ['cash'] as const,
  preview: () => [...cashKeys.all, 'preview'] as const,
}

export const cashApi = {
  preview: () => httpClient.get<CashPreviewDto>(endpoints.cash.preview()),
  close: (request: CloseCashRequest) =>
    httpClient.post<CashClosingDto>(endpoints.cash.close(), request),
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

export function useCloseCash() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cashApi.close,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: cashKeys.preview() })
      void queryClient.invalidateQueries({ queryKey: shiftKeys.context })
      void queryClient.invalidateQueries({ queryKey: shiftKeys.mine })
    },
    onError: (error: unknown) => {
      if (error instanceof HttpError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey: cashKeys.preview() })
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
