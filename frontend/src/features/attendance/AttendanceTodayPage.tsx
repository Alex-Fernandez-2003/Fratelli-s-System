import { useEffect, useState } from 'react'
import { LogOut, LogIn, RefreshCw } from 'lucide-react'
import { Badge, Button, Skeleton } from '../../components/atoms'
import { Alert, EmptyState, StatCard } from '../../components/molecules'
import { BUSINESS_LOCATION_LABEL } from '../../lib/business-time'
import { HttpError } from '../../lib/api/http-client'
import type { AttendanceTodayItem } from './api'
import { useAttendanceToday, useCheckIn, useCheckOut } from './hooks'
import { errorMessage, formatTime, recordDuration } from './format'

const STATE_META: Record<
  string,
  { label: string; tone: 'success' | 'warning' | 'neutral'; dotClass: string }
> = {
  OPEN: { label: 'Abierta', tone: 'success', dotClass: 'bg-success' },
  CLOSED: { label: 'Cerrada', tone: 'neutral', dotClass: 'bg-text-muted' },
  NO_RECORD: { label: 'Sin registro', tone: 'warning', dotClass: 'bg-warning' },
}

function EmployeeCard({
  item,
  onCheckIn,
  onCheckOut,
  isPending,
  pendingAction,
}: {
  item: AttendanceTodayItem
  onCheckIn: () => void
  onCheckOut: () => void
  isPending: boolean
  pendingAction: 'check-in' | 'check-out' | null
}) {
  const state = STATE_META[item.currentState] ?? STATE_META.NO_RECORD
  const latestRecord =
    item.attendanceRecords.find((r) => !r.checkOutAt) ?? item.attendanceRecords[0]

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold text-text-muted">
        {item.fullName.charAt(0).toUpperCase()}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-bold">{item.fullName}</span>
          <span className={`size-2 rounded-full ${state.dotClass}`} />
          <Badge tone={state.tone}>{state.label}</Badge>
        </div>
        {latestRecord && (
          <p className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
            <span>{formatTime(latestRecord.checkInAt)}</span>
            <span>→</span>
            <span>{latestRecord.checkOutAt ? formatTime(latestRecord.checkOutAt) : '…'}</span>
            <span className="text-text-muted">({recordDuration(latestRecord)})</span>
          </p>
        )}
      </div>

      <div className="shrink-0">
        {item.currentState === 'OPEN' ? (
          <Button
            size="sm"
            variant="danger"
            loading={isPending && pendingAction === 'check-out'}
            leftIcon={<LogOut size={14} />}
            onClick={onCheckOut}
          >
            Salida
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={!item.isActive}
            loading={isPending && pendingAction === 'check-in'}
            leftIcon={<LogIn size={14} />}
            onClick={onCheckIn}
          >
            Entrada
          </Button>
        )}
      </div>
    </div>
  )
}

export function AttendanceTodayPage() {
  const today = useAttendanceToday(true)
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()

  const items = today.data?.items ?? []
  const openCount = items.filter((i) => i.currentState === 'OPEN').length
  const closedCount = items.filter((i) => i.currentState === 'CLOSED').length
  const activeCount = items.filter((i) => i.isActive).length

  const mutationError = checkIn.error ?? checkOut.error
  const lastSuccess = checkIn.isSuccess ? checkIn.data : checkOut.isSuccess ? checkOut.data : null
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (checkIn.isPending || checkOut.isPending) setShowSuccess(false)
  }, [checkIn.isPending, checkOut.isPending])
  useEffect(() => {
    if (lastSuccess) setShowSuccess(true)
  }, [lastSuccess])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Asistencia del día</h1>
          <p className="text-sm text-text-muted">
            {today.data
              ? `Fecha de negocio ${today.data.businessDate} · ${BUSINESS_LOCATION_LABEL}`
              : 'Marca la entrada y salida del personal.'}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          loading={today.isFetching}
          leftIcon={<RefreshCw size={14} />}
          onClick={() => void today.refetch()}
        >
          Actualizar
        </Button>
      </div>

      {today.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Personal activo"
            value={activeCount}
            trend={`${items.length} en total`}
          />
          <StatCard label="Ciclos abiertos" value={openCount} trend="Trabajando ahora" />
          <StatCard label="Ciclos cerrados" value={closedCount} trend="Turno completado" />
        </div>
      )}

      {showSuccess && !mutationError && lastSuccess && (
        <Alert kind="success" title="Asistencia actualizada">
          Registro a las {formatTime(lastSuccess.checkInAt)}
          {lastSuccess.checkOutAt
            ? ` · salida a las ${formatTime(lastSuccess.checkOutAt)}.`
            : ' · ciclo abierto.'}
        </Alert>
      )}
      {mutationError && (
        <Alert kind="error" title="No se pudo registrar">
          {mutationError instanceof HttpError
            ? (mutationError.problem.detail ?? 'Error inesperado.')
            : 'Error inesperado.'}
        </Alert>
      )}

      {today.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : today.isError ? (
        <Alert kind="error" title="No se pudo cargar la asistencia">
          {errorMessage(today.error)}
        </Alert>
      ) : items.length === 0 ? (
        <EmptyState title="Sin personal registrado">No hay empleados cargados todavía.</EmptyState>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <EmployeeCard
              key={item.employeeId}
              item={item}
              onCheckIn={() => checkIn.mutate(item.employeeId)}
              onCheckOut={() => checkOut.mutate(item.employeeId)}
              isPending={checkIn.isPending || checkOut.isPending}
              pendingAction={
                checkIn.isPending ? 'check-in' : checkOut.isPending ? 'check-out' : null
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
