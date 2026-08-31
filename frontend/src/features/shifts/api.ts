import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { endpoints } from '@/lib/api/endpoints'
import { httpClient, HttpError } from '@/lib/api/http-client'
import type { components } from '@/types/api.generated'

/**
 * Tipos derivados 1:1 del contrato OpenAPI generado (HU-025).
 * No se inventan campos: si algo no está aquí, el backend no lo expone todavía.
 */
export type ShiftType = components['schemas']['ShiftType']
export type ShiftStatus = components['schemas']['ShiftStatus']
export type ShiftDto = components['schemas']['ShiftDto']
export type ShiftContextDto = components['schemas']['ShiftContextDto']
export type ShiftAssignmentRequest = components['schemas']['ShiftAssignmentRequest']
export type HandoverRequest = components['schemas']['HandoverRequest']

/** ADMIN/ENCARGADO mutan y leen el contexto operativo completo (docs handoff Sprint 2). */
export const SHIFT_MANAGE_ROLES = ['ADMINISTRADOR', 'ENCARGADO'] as const

export const shiftKeys = {
  context: ['shifts', 'context'] as const,
  mine: ['shifts', 'mine'] as const,
}

export const shiftsApi = {
  current: () => httpClient.get<ShiftContextDto>(endpoints.shifts.current()),
  mine: () => httpClient.get<ShiftDto>(endpoints.shifts.meCurrent()),
  open: () => httpClient.post<ShiftContextDto>(endpoints.shifts.open()),
  updateAssignments: (id: string, request: ShiftAssignmentRequest) =>
    httpClient.put<ShiftDto>(endpoints.shifts.assignments(id), request),
  handover: (id: string, request: HandoverRequest) =>
    httpClient.post<ShiftContextDto>(endpoints.shifts.handover(id), request),
}

/** GET /api/v1/shifts/current — contexto del día operativo (ADMIN/ENCARGADO). 404 = aún no se abrió jornada. */
export function useShiftContext() {
  return useQuery({
    queryKey: shiftKeys.context,
    queryFn: shiftsApi.current,
    staleTime: 15_000,
    retry: (failureCount, error) =>
      !(error instanceof HttpError && error.status === 404) && failureCount < 2,
  })
}

/** GET /api/v1/shifts/me/current — mi turno actual (cualquier rol autenticado). 404 = sin turno asignado hoy. */
export function useMyShift() {
  return useQuery({
    queryKey: shiftKeys.mine,
    queryFn: shiftsApi.mine,
    staleTime: 15_000,
    retry: (failureCount, error) =>
      !(error instanceof HttpError && error.status === 404) && failureCount < 2,
  })
}

/** POST /api/v1/shifts/open — abre la jornada y crea la CashSession compartida con los dos turnos fijos. */
export function useOpenShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: shiftsApi.open,
    onSuccess: (data) => {
      queryClient.setQueryData(shiftKeys.context, data)
      void queryClient.invalidateQueries({ queryKey: shiftKeys.mine })
    },
  })
}

/** PUT /api/v1/shifts/{id}/assignments — reemplaza la lista de empleados asignados a un turno. */
export function useUpdateShiftAssignments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: ShiftAssignmentRequest }) =>
      shiftsApi.updateAssignments(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: shiftKeys.context })
      void queryClient.invalidateQueries({ queryKey: shiftKeys.mine })
    },
  })
}

/** POST /api/v1/shifts/{id}/handover — traspaso: cierra el turno origen y activa el destino. No cierra la caja. */
export function useHandoverShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: HandoverRequest }) =>
      shiftsApi.handover(id, request),
    onSuccess: (data) => {
      queryClient.setQueryData(shiftKeys.context, data)
      void queryClient.invalidateQueries({ queryKey: shiftKeys.mine })
    },
  })
}
