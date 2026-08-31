import { Moon, Sun, Users } from 'lucide-react'
import { Badge, Skeleton } from '../components/atoms'
import { Alert, EmptyState } from '../components/molecules'
import { useAuth } from '../features/auth/AuthProvider'
import { useMyShift } from '../features/shifts/api'
import {
  SHIFT_STATUS_LABEL,
  SHIFT_STATUS_TONE,
  SHIFT_TYPE_LABEL,
  SHIFT_TYPE_SCHEDULE,
  shiftErrorMessage,
} from '../features/shifts/format'
import { HttpError } from '../lib/api/http-client'

const SHIFT_ICON = { MORNING: Sun, NIGHT: Moon } as const

export function MyShiftPage() {
  const { user } = useAuth()
  const shift = useMyShift()
  const notAssignedToday =
    shift.isError && shift.error instanceof HttpError && shift.error.status === 404

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mi turno</h1>
          <p className="text-sm text-text-muted">Información operativa de tu turno actual.</p>
        </div>
        {user && user.roles.length > 0 && <Badge>Rol: {user.roles.join(' / ')}</Badge>}
      </header>

      {shift.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24" />
        </div>
      ) : notAssignedToday ? (
        <EmptyState title="Todavía no estás asignado a un turno hoy">
          Cuando un encargado te asigne a Turno mañana o Turno noche, aparecerá aquí.
        </EmptyState>
      ) : shift.isError ? (
        <Alert kind="error">{shiftErrorMessage(shift.error)}</Alert>
      ) : shift.data ? (
        (() => {
          const Icon = SHIFT_ICON[shift.data.type]
          const colleagues = shift.data.employeeIds.filter((id) => id !== user?.employeeId).length
          return (
            <section className="grid gap-4 rounded-lg border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold">
                    <Icon aria-hidden="true" size={18} className="text-brand-orange" />
                    {SHIFT_TYPE_LABEL[shift.data.type]}
                  </h2>
                  <p className="text-sm text-text-muted">{SHIFT_TYPE_SCHEDULE[shift.data.type]}</p>
                </div>
                <Badge tone={SHIFT_STATUS_TONE[shift.data.status]}>
                  {SHIFT_STATUS_LABEL[shift.data.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-2 border-t border-border pt-4 text-sm text-text-muted">
                <Users aria-hidden="true" size={16} />
                {colleagues > 0
                  ? `${colleagues} compañero${colleagues === 1 ? '' : 's'} más en este turno`
                  : 'Sos el único asignado a este turno por ahora'}
              </div>
            </section>
          )
        })()
      ) : null}
    </div>
  )
}
