import { useMemo, useState, useEffect } from 'react'
import { Calendar, CheckCircle, LogOut, LogIn, Clock, AlertTriangle, Home } from 'lucide-react'
import { Badge, Button, Input, Label, Skeleton } from '../components/atoms'
import { Alert, EmptyState } from '../components/molecules'
import { AppLayout } from '../components/templates/AppLayout'
import { useAuth } from '../features/auth/AuthProvider'
import type { AttendanceRecordDto } from '../features/attendance/api'
import { useCheckIn, useCheckOut, useMyAttendance } from '../features/attendance/hooks'
import {
  errorMessage,
  formatTime,
  formatDayShort,
  recordDuration,
  elapsedSince,
  totalDuration,
} from '../features/attendance/format'
import { HttpError } from '../lib/api/http-client'

const ATTENDANCE_MANAGE_ROLES = ['ADMINISTRADOR', 'ENCARGADO']

function StatusCard({
  openRecord,
  onCheckIn,
  onCheckOut,
  isLoading,
  isPending,
  error,
  canRegister,
}: {
  openRecord: AttendanceRecordDto | null | undefined
  onCheckIn: () => void
  onCheckOut: () => void
  isLoading: boolean
  isPending: boolean
  error: unknown
  canRegister: boolean
}) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    if (!openRecord) return
    const tick = () => setElapsed(elapsedSince(openRecord.checkInAt))
    tick()
    const interval = setInterval(tick, 60_000)
    return () => clearInterval(interval)
  }, [openRecord])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-danger bg-surface p-6 text-center">
        <AlertTriangle className="mx-auto mb-3 size-10 text-danger" />
        <h3 className="mb-1 text-lg font-bold">Error de conexión</h3>
        <p className="mb-4 text-sm text-text-muted">
          No pudimos sincronizar tu estado de asistencia. Por favor, verifica tu conexión e intenta
          de nuevo.
        </p>
        {canRegister && (
          <Button variant="secondary" onClick={onCheckIn}>
            Reintentar carga
          </Button>
        )}
      </div>
    )
  }

  if (openRecord) {
    return (
      <div className="rounded-2xl border border-success/30 bg-surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <CheckCircle className="size-5 text-success" />
          <div>
            <p className="text-xs font-bold uppercase text-text-muted">Estado actual</p>
            <p className="flex items-center gap-2 text-sm font-bold text-success">
              <span className="size-2 rounded-full bg-success" /> Jornada Activa
            </p>
          </div>
          <span className="ml-auto text-xs text-text-muted">
            {formatDayShort(openRecord.checkInAt)}
          </span>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface-elevated p-4 text-center">
            <p className="mb-1 text-[0.7rem] font-bold uppercase text-text-muted">Entrada</p>
            <p className="text-xl font-bold tabular-nums text-brand-orange">
              {formatTime(openRecord.checkInAt)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface-elevated p-4 text-center">
            <p className="mb-1 text-[0.7rem] font-bold uppercase text-text-muted">Transcurrido</p>
            <p className="text-xl font-bold tabular-nums text-brand-orange">{elapsed}</p>
          </div>
        </div>

        {canRegister ? (
          <Button
            variant="danger"
            fullWidth
            size="lg"
            loading={isPending}
            leftIcon={<LogOut size={18} />}
            onClick={onCheckOut}
          >
            Registrar salida
          </Button>
        ) : (
          <p className="text-center text-sm text-text-muted">
            Tu hora de entrada fue registrada por un administrador o encargado.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 text-center">
      <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-surface-elevated">
        <Calendar className="size-7 text-text-muted" />
      </div>
      <h3 className="mb-1 text-lg font-bold">
        {new Date().toLocaleDateString('es-BO', {
          timeZone: 'America/La_Paz',
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </h3>
      {canRegister ? (
        <>
          <p className="mb-5 text-sm text-text-muted">
            No tienes una asistencia abierta para el día de hoy.
          </p>
          <Button
            fullWidth
            size="lg"
            loading={isPending}
            leftIcon={<LogIn size={18} />}
            onClick={onCheckIn}
          >
            Registrar entrada
          </Button>
        </>
      ) : (
        <p className="mb-5 text-sm text-text-muted">
          No tienes una asistencia abierta para el día de hoy. Tu hora será registrada por un
          administrador o encargado.
        </p>
      )}
    </div>
  )
}

function HistoryItem({ record }: { record: AttendanceRecordDto }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-bold">{formatDayShort(record.checkInAt)}</p>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-success" />
            {formatTime(record.checkInAt)}
          </span>
          {record.checkOutAt && (
            <span className="flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-danger" />
              {formatTime(record.checkOutAt)}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-text-muted">{recordDuration(record)}</span>
        <Badge tone={record.checkOutAt ? 'neutral' : 'success'}>
          {record.checkOutAt ? 'Cerrada' : 'Abierta'}
        </Badge>
      </div>
    </div>
  )
}

export function MyAttendancePage() {
  const { user } = useAuth()
  const canRegister = user
    ? ATTENDANCE_MANAGE_ROLES.some((role) => user.roles.includes(role))
    : false
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const filters = useMemo(
    () => ({ from: from || undefined, to: to || undefined, page }),
    [from, to, page],
  )
  const history = useMyAttendance(filters)
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()

  const items = history.data?.items ?? []
  const openRecord = items.find((r) => !r.checkOutAt) ?? null
  const closedRecords = items.filter((r) => r.checkOutAt)
  const hasFilters = Boolean(from || to)
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
    <AppLayout
      bottomNavItems={[
        { to: '/inicio', icon: <Home size={20} />, label: 'Inicio' },
        { to: '/asistencia', icon: <Clock size={20} />, label: 'Asistencia' },
      ]}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold">Mi asistencia</h1>
          <p className="text-sm text-text-muted">
            {canRegister
              ? 'Gestiona tu jornada laboral de hoy.'
              : 'Consulta tu estado de asistencia y horario registrado.'}
          </p>
        </div>

        {/* Status card */}
        <StatusCard
          openRecord={openRecord}
          onCheckIn={() => checkIn.mutate('')}
          onCheckOut={() => checkOut.mutate('')}
          isLoading={history.isLoading}
          isPending={checkIn.isPending || checkOut.isPending}
          error={history.error}
          canRegister={canRegister}
        />

        {/* Success feedback */}
        {showSuccess && !mutationError && lastSuccess && (
          <Alert kind="success" title="Entrada registrada">
            Registrada con éxito a las {formatTime(lastSuccess.checkInAt)}.
          </Alert>
        )}

        {/* Error feedback */}
        {mutationError && (
          <Alert kind="error" title="No se pudo registrar">
            {mutationError instanceof HttpError
              ? (mutationError.problem.detail ?? 'Error inesperado.')
              : 'Error inesperado.'}
          </Alert>
        )}

        {/* History */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Clock size={18} className="text-text-muted" />
              Historial reciente
            </h2>
          </div>

          {/* Filters */}
          <form
            className="mb-4 flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              setPage(1)
            }}
          >
            <div>
              <Label htmlFor="from">Desde</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="to">Hasta</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              Aplicar
            </Button>
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFrom('')
                  setTo('')
                  setPage(1)
                }}
              >
                Limpiar
              </Button>
            )}
          </form>

          {history.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : history.isError ? (
            <Alert kind="error">{errorMessage(history.error)}</Alert>
          ) : items.length === 0 ? (
            <EmptyState title="Aún no tienes registros de asistencia">
              {hasFilters
                ? 'No hay registros en el rango seleccionado.'
                : 'Registra tu primera entrada para comenzar.'}
            </EmptyState>
          ) : (
            <>
              {closedRecords.length > 0 && (
                <p className="mb-2 text-xs font-bold uppercase text-text-muted">
                  Horas acumuladas: {totalDuration(closedRecords)}
                </p>
              )}
              <div className="space-y-2">
                {items.map((record) => (
                  <HistoryItem key={record.id} record={record} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
