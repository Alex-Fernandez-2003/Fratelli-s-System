import { useEffect, useState } from 'react'
import { Clock, LogIn, LogOut, RefreshCw } from 'lucide-react'
import { Badge, Button, Card, Input, Skeleton } from '../components/atoms'
import { Alert, EmptyState, FormField } from '../components/molecules'
import { createMyAttendanceFilters, useMyAttendanceFilterState } from '../features/attendance/api'
import type {
  AttendanceCurrentResponse,
  AttendanceLifecycle,
  MyAttendanceFilters,
  PersonalAttendanceRecordDto,
  ShiftType,
} from '../features/attendance/api'
import {
  errorMessage,
  elapsedSince,
  formatBusinessDate,
  formatBusinessDateShort,
  formatDurationMinutes,
  formatTime,
} from '../features/attendance/format'
import {
  useAttendanceCurrent,
  useCheckInSelf,
  useCheckOutSelf,
  useMyAttendance,
} from '../features/attendance/hooks'
import { HttpError } from '../lib/api/http-client'

const LIFECYCLE_META: Record<
  AttendanceLifecycle,
  { label: string; tone: 'success' | 'warning' | 'neutral' }
> = {
  NO_ASSIGNMENT: { label: 'Sin asignación', tone: 'warning' },
  NO_RECORD: { label: 'Sin entrada', tone: 'warning' },
  OPEN: { label: 'Abierta', tone: 'success' },
  CLOSED: { label: 'Cerrada', tone: 'neutral' },
  ABSENT: { label: 'Ausencia registrada', tone: 'warning' },
}

const SHIFT_LABELS: Record<ShiftType, string> = {
  MORNING: 'Mañana',
  NIGHT: 'Noche',
}

function statusOf(error: unknown): number | undefined {
  if (error instanceof HttpError) return error.status
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const value = (error as { status?: unknown }).status
    return typeof value === 'number' ? value : undefined
  }
  return undefined
}

function formatShift(shiftType: ShiftType | null | undefined): string {
  return shiftType ? SHIFT_LABELS[shiftType] : 'Sin turno asignado'
}

function formatPunctuality(record: PersonalAttendanceRecordDto): string {
  return record.isLate ? `Tarde · ${Number(record.lateMinutes)} min` : 'A tiempo'
}

function Elapsed({ checkInAt }: { checkInAt: string }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    setNow(Date.now())
    const interval = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(interval)
  }, [checkInAt])

  return <span>{elapsedSince(checkInAt, now)}</span>
}

function CurrentRecord({ record }: { record: PersonalAttendanceRecordDto }) {
  const isOpen = record.lifecycle === 'OPEN'
  return (
    <dl className="grid gap-2 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-text-muted">Turno / snapshot</dt>
        <dd className="m-0 font-bold">{formatShift(record.shiftType)}</dd>
      </div>
      <div>
        <dt className="text-text-muted">Estado del registro</dt>
        <dd className="m-0 font-bold">{LIFECYCLE_META[record.lifecycle].label}</dd>
      </div>
      <div>
        <dt className="text-text-muted">Entrada</dt>
        <dd className="m-0 font-bold">{formatTime(record.checkInAt)}</dd>
      </div>
      <div>
        <dt className="text-text-muted">Salida</dt>
        <dd className="m-0 font-bold">{record.checkOutAt ? formatTime(record.checkOutAt) : '—'}</dd>
      </div>
      <div>
        <dt className="text-text-muted">Horario planificado</dt>
        <dd className="m-0 font-bold">
          {record.plannedStart && record.plannedEnd
            ? `${formatTime(record.plannedStart)} – ${formatTime(record.plannedEnd)}`
            : '—'}
        </dd>
      </div>
      <div>
        <dt className="text-text-muted">Puntualidad</dt>
        <dd className="m-0 font-bold">{formatPunctuality(record)}</dd>
      </div>
      <div>
        <dt className="text-text-muted">Tiempo trabajado</dt>
        <dd className="m-0 font-bold">{formatDurationMinutes(record.workedMinutes)}</dd>
      </div>
      {isOpen && (
        <div>
          <dt className="text-text-muted">Transcurrido</dt>
          <dd className="m-0 font-bold" aria-live="polite">
            <Elapsed checkInAt={record.checkInAt} />
          </dd>
        </div>
      )}
    </dl>
  )
}

function CurrentAttendance({
  current,
  pending,
  onCheckIn,
  onCheckOut,
}: {
  current: AttendanceCurrentResponse
  pending: boolean
  onCheckIn: () => void
  onCheckOut: () => void
}) {
  const metadata = LIFECYCLE_META[current.lifecycle]
  const isOpen = current.lifecycle === 'OPEN'
  const record = current.record

  return (
    <Card data-testid="attendance-current" className="grid gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-lg font-bold">Estado actual</h2>
          <p className="m-0 text-sm text-text-muted">
            Fecha de negocio: {formatBusinessDate(current.businessDate)} · {current.timeZone}
          </p>
        </div>
        <Badge tone={metadata.tone}>{metadata.label}</Badge>
      </div>

      {current.lifecycle === 'NO_ASSIGNMENT' && (
        <p className="m-0 text-sm text-text-muted">
          No tienes un turno asignado para esta fecha. El estado mostrado proviene del registro de
          asistencia del servidor.
        </p>
      )}
      {current.lifecycle === 'NO_RECORD' && (
        <p className="m-0 text-sm text-text-muted">
          No hay una entrada abierta ni un registro cerrado para esta fecha.
        </p>
      )}
      {current.lifecycle === 'ABSENT' && (
        <p className="m-0 text-sm text-text-muted">
          El servidor marcó esta fecha como ausencia. No se infirió este estado desde el historial.
        </p>
      )}
      {current.lifecycle === 'OPEN' && (
        <p className="m-0 text-sm text-text-muted">
          Tu entrada está abierta y puede registrarse la salida.
        </p>
      )}
      {current.lifecycle === 'CLOSED' && (
        <p className="m-0 text-sm text-text-muted">
          Este es tu registro más reciente y ya está cerrado.
        </p>
      )}

      {record && <CurrentRecord record={record} />}

      <div className="flex flex-wrap gap-3">
        {isOpen ? (
          <Button
            type="button"
            variant="danger"
            loading={pending}
            disabled={pending}
            leftIcon={<LogOut size={16} />}
            onClick={onCheckOut}
          >
            Registrar salida
          </Button>
        ) : (
          <Button
            type="button"
            loading={pending}
            disabled={pending}
            leftIcon={<LogIn size={16} />}
            onClick={onCheckIn}
          >
            Registrar entrada
          </Button>
        )}
      </div>
    </Card>
  )
}

function HistoryRow({ record }: { record: PersonalAttendanceRecordDto }) {
  return (
    <tr>
      <td className="border-b border-border p-3 text-left">
        {formatBusinessDateShort(record.businessDate)}
      </td>
      <td className="border-b border-border p-3 text-left">{formatShift(record.shiftType)}</td>
      <td className="border-b border-border p-3 text-left">{formatTime(record.checkInAt)}</td>
      <td className="border-b border-border p-3 text-left">
        {record.checkOutAt ? formatTime(record.checkOutAt) : '—'}
      </td>
      <td className="border-b border-border p-3 text-left">
        <Badge tone={LIFECYCLE_META[record.lifecycle].tone}>
          {LIFECYCLE_META[record.lifecycle].label}
        </Badge>
      </td>
      <td className="border-b border-border p-3 text-left">{formatPunctuality(record)}</td>
      <td className="border-b border-border p-3 text-left">
        {formatDurationMinutes(record.workedMinutes)}
      </td>
    </tr>
  )
}

function HistoryCard({ record }: { record: PersonalAttendanceRecordDto }) {
  return (
    <Card className="grid min-w-0 gap-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <strong>{formatBusinessDateShort(record.businessDate)}</strong>
        <Badge tone={LIFECYCLE_META[record.lifecycle].tone}>
          {LIFECYCLE_META[record.lifecycle].label}
        </Badge>
      </div>
      <dl className="grid gap-1 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Turno</dt>
          <dd className="m-0 text-right font-bold">{formatShift(record.shiftType)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Entrada</dt>
          <dd className="m-0 text-right font-bold">{formatTime(record.checkInAt)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Salida</dt>
          <dd className="m-0 text-right font-bold">
            {record.checkOutAt ? formatTime(record.checkOutAt) : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Puntualidad</dt>
          <dd className="m-0 text-right font-bold">{formatPunctuality(record)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Tiempo trabajado</dt>
          <dd className="m-0 text-right font-bold">
            {formatDurationMinutes(record.workedMinutes)}
          </dd>
        </div>
      </dl>
    </Card>
  )
}

function HistoryPagination({
  filters,
  totalCount,
  totalPages,
  onPageChange,
}: {
  filters: MyAttendanceFilters
  totalCount: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const page = Number(filters.page)
  const pageSize = Number(filters.pageSize)
  const first = totalCount ? (page - 1) * pageSize + 1 : 0
  const last = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-text-muted">
      <span>
        Mostrando {first}–{last} de {totalCount}
      </span>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior de mi asistencia"
        >
          Anterior
        </Button>
        <span className="flex min-h-10 items-center px-1" aria-live="polite">
          Página {page} de {Math.max(1, totalPages)}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page >= Math.max(1, totalPages)}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente de mi asistencia"
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

function isHistoryFiltered(filters: MyAttendanceFilters, defaults: MyAttendanceFilters): boolean {
  return Boolean(filters.from !== defaults.from || filters.to !== defaults.to)
}

export function MyAttendancePage() {
  const { filters, updateFilters, setPage, clearFilters } = useMyAttendanceFilterState()
  const defaults = createMyAttendanceFilters()
  const current = useAttendanceCurrent()
  const historyEnabled = Boolean(current.data) && !current.isError
  const history = useMyAttendance(filters, historyEnabled)
  const checkIn = useCheckInSelf()
  const checkOut = useCheckOutSelf()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const mutationError = checkIn.error ?? checkOut.error
  const pending = checkIn.isPending || checkOut.isPending
  const noEmployee = current.isError && statusOf(current.error) === 404
  const currentError = current.isError && !noEmployee
  const items = history.data?.items ?? []
  const totalCount = Number(history.data?.totalCount ?? 0)
  const totalPages = Number(history.data?.totalPages ?? 1)
  const filtered = isHistoryFiltered(filters, defaults)

  const onMutationSuccess = (record: PersonalAttendanceRecordDto) => {
    setSuccessMessage(
      record.checkOutAt
        ? `Entrada ${formatTime(record.checkInAt)} · salida ${formatTime(record.checkOutAt)}.`
        : `Entrada registrada a las ${formatTime(record.checkInAt)}.`,
    )
    void current.refetch()
  }
  const onMutationError = () => {
    setSuccessMessage(null)
    void current.refetch()
  }

  return (
    <div className="mx-auto grid min-w-0 max-w-5xl gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-2xl font-bold">Mi asistencia</h1>
          <p className="m-0 text-sm text-text-muted">
            Registra tu entrada y salida y consulta el historial autoritativo.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={current.isFetching}
          leftIcon={<RefreshCw size={14} />}
          onClick={() => void current.refetch()}
        >
          Actualizar estado
        </Button>
      </header>

      {successMessage && !mutationError && (
        <Alert kind="success" title="Asistencia actualizada">
          {successMessage}
        </Alert>
      )}
      {mutationError && (
        <Alert kind="error" title="No se pudo registrar la asistencia">
          {errorMessage(mutationError, 'No se pudo registrar la asistencia. Intenta nuevamente.')}
        </Alert>
      )}

      <section aria-labelledby="current-attendance-heading">
        <h2 id="current-attendance-heading" className="sr-only">
          Estado actual de asistencia
        </h2>
        {current.isLoading ? (
          <Card className="grid gap-3" aria-busy="true">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-16" />
            <Skeleton className="h-10 w-44" />
          </Card>
        ) : noEmployee ? (
          <Card className="grid gap-2">
            <h2 className="m-0 text-lg font-bold">Usuario sin empleado vinculado</h2>
            <p className="m-0">Tu usuario no está vinculado a un registro de empleado.</p>
            <p className="m-0 text-sm text-text-muted">
              Solicita a un administrador o encargado que vincule tu usuario con un registro de
              empleado. Después podrás volver a consultar y registrar tu asistencia.
            </p>
          </Card>
        ) : currentError ? (
          <Alert kind="error" title="No se pudo cargar tu asistencia">
            <span className="block">
              {errorMessage(current.error, 'No se pudo cargar tu estado actual.')}
            </span>
            <Button
              type="button"
              className="mt-3"
              variant="outline"
              onClick={() => void current.refetch()}
            >
              Reintentar estado actual
            </Button>
          </Alert>
        ) : current.data ? (
          <CurrentAttendance
            current={current.data}
            pending={pending}
            onCheckIn={() => {
              setSuccessMessage(null)
              checkIn.mutate(undefined, { onSuccess: onMutationSuccess, onError: onMutationError })
            }}
            onCheckOut={() => {
              setSuccessMessage(null)
              checkOut.mutate(undefined, { onSuccess: onMutationSuccess, onError: onMutationError })
            }}
          />
        ) : null}
      </section>

      {!noEmployee && !currentError && current.data && (
        <section className="grid min-w-0 gap-4" aria-labelledby="attendance-history-heading">
          <div className="flex items-center gap-2">
            <Clock aria-hidden={true} size={18} className="text-text-muted" />
            <h2 id="attendance-history-heading" className="m-0 text-lg font-bold">
              Historial de asistencia
            </h2>
          </div>
          <Card className="grid min-w-0 gap-4">
            <form
              className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:items-end"
              onSubmit={(event) => {
                event.preventDefault()
                setPage(1)
              }}
            >
              <FormField label="Desde">
                <Input
                  type="date"
                  value={filters.from ?? ''}
                  onChange={(event) => updateFilters({ from: event.target.value || undefined })}
                />
              </FormField>
              <FormField label="Hasta">
                <Input
                  type="date"
                  value={filters.to ?? ''}
                  onChange={(event) => updateFilters({ to: event.target.value || undefined })}
                />
              </FormField>
              <Button type="submit" variant="secondary" size="sm">
                Aplicar
              </Button>
              {filtered && (
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  Volver al mes actual
                </Button>
              )}
            </form>

            {history.isLoading && !history.data ? (
              <div
                className="grid gap-3"
                role="status"
                aria-label="Cargando historial de asistencia"
              >
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            ) : history.isError ? (
              <Alert kind="error" title="No se pudo cargar el historial">
                <span className="block">
                  {errorMessage(history.error, 'No se pudo cargar tu historial de asistencia.')}
                </span>
                <Button
                  type="button"
                  className="mt-3"
                  variant="outline"
                  onClick={() => void history.refetch()}
                >
                  Reintentar historial
                </Button>
              </Alert>
            ) : !items.length ? (
              <EmptyState
                title={filtered ? 'No hay registros para este filtro' : 'No hay registros este mes'}
              >
                {filtered
                  ? 'No se encontraron registros de asistencia en el período seleccionado.'
                  : 'Tu historial aparecerá aquí cuando exista un registro de asistencia.'}
              </EmptyState>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table
                    className="w-full min-w-[54rem] border-collapse"
                    aria-label="Historial de mi asistencia"
                  >
                    <thead>
                      <tr>
                        {[
                          'Fecha',
                          'Turno',
                          'Entrada',
                          'Salida',
                          'Estado',
                          'Puntualidad',
                          'Trabajado',
                        ].map((heading) => (
                          <th
                            key={heading}
                            className="border-b border-border p-3 text-left"
                            scope="col"
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((record) => (
                        <HistoryRow key={record.id} record={record} />
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-3 md:hidden">
                  {items.map((record) => (
                    <HistoryCard key={record.id} record={record} />
                  ))}
                </div>
                <HistoryPagination
                  filters={filters}
                  totalCount={totalCount}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
            {history.isFetching && history.data && !history.isError && (
              <p className="m-0 text-sm text-text-muted" role="status">
                Actualizando historial…
              </p>
            )}
          </Card>
        </section>
      )}
    </div>
  )
}
