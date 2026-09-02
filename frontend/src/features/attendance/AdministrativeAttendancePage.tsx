import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card, Input, Select, Skeleton } from '../../components/atoms'
import { Alert, EmptyState, FormField, StatCard } from '../../components/molecules'
import { Modal, PageHeader } from '../../components/organisms'
import {
  createAdministrativeAttendanceFilters,
  useAdministrativeAttendanceFilterState,
} from './api'
import type {
  AdministrativeAttendanceFilters,
  AdministrativeAttendanceRow,
  AttendanceLifecycle,
  EmployeeAttendanceSummary,
  ShiftType,
} from './api'
import { errorMessage, formatBusinessDateShort, formatDurationMinutes, formatTime } from './format'
import { useAttendanceAdmin, useAttendanceAdminOptions } from './hooks'

const SHIFT_LABELS: Record<ShiftType, string> = {
  MORNING: 'Mañana',
  NIGHT: 'Noche',
}

const LIFECYCLE_META: Record<
  AttendanceLifecycle,
  { label: string; tone: 'success' | 'warning' | 'neutral' }
> = {
  NO_ASSIGNMENT: { label: 'Sin asignación', tone: 'warning' },
  NO_RECORD: { label: 'Sin registro', tone: 'warning' },
  OPEN: { label: 'Abierta', tone: 'success' },
  CLOSED: { label: 'Cerrada', tone: 'neutral' },
  ABSENT: { label: 'Ausencia', tone: 'warning' },
}

export const ATTENDANCE_SHIFT_OPTIONS: readonly { value: ShiftType; label: string }[] = [
  { value: 'MORNING', label: 'Mañana' },
  { value: 'NIGHT', label: 'Noche' },
]

export const ATTENDANCE_OUTCOME_OPTIONS: readonly {
  value: AttendanceLifecycle
  label: string
}[] = [
  { value: 'NO_ASSIGNMENT', label: 'Sin asignación' },
  { value: 'NO_RECORD', label: 'Sin registro' },
  { value: 'OPEN', label: 'Abierta' },
  { value: 'CLOSED', label: 'Cerrada' },
  { value: 'ABSENT', label: 'Ausencia' },
]

function formatShift(value: ShiftType | null | undefined): string {
  return value ? SHIFT_LABELS[value] : '—'
}

function formatOutcome(value: AttendanceLifecycle): string {
  return LIFECYCLE_META[value]?.label ?? value
}

function formatPunctuality(row: AdministrativeAttendanceRow): string {
  return row.isLate ? `Tarde · ${Number(row.lateMinutes)} min` : 'A tiempo'
}

function formatNullableTime(value: string | null | undefined): string {
  return value ? formatTime(value) : '—'
}

/**
 * Administrative rows intentionally do not expose an attendance id. The full
 * server snapshot plus its position keeps repeated same-day rows addressable
 * without inventing a domain identifier.
 */
export function attendanceRowKey(row: AdministrativeAttendanceRow, index: number): string {
  return [
    row.employeeId,
    row.businessDate,
    row.shiftType,
    row.plannedStart ?? 'sin-inicio',
    row.plannedEnd ?? 'sin-fin',
    row.checkInAt ?? 'sin-entrada',
    row.checkOutAt ?? 'sin-salida',
    index,
  ].join('|')
}

function updateFilter<T extends keyof Omit<AdministrativeAttendanceFilters, 'page' | 'pageSize'>>(
  update: (updates: Partial<Omit<AdministrativeAttendanceFilters, 'page' | 'pageSize'>>) => void,
  key: T,
  value: AdministrativeAttendanceFilters[T],
) {
  update({ [key]: value } as Partial<Omit<AdministrativeAttendanceFilters, 'page' | 'pageSize'>>)
}

function SummaryCards({
  summary,
  isLoading,
}: {
  summary?: {
    totalRecords: number | string
    lateCount: number | string
    totalWorkedMinutes: number | string
    absenceCount: number | string
  }
  isLoading: boolean
}) {
  const numberValue = (value: number | string | undefined) =>
    value === undefined ? (isLoading ? '…' : '—') : Number(value)
  const minutesValue = (value: number | string | undefined) =>
    value === undefined ? (isLoading ? '…' : '—') : formatDurationMinutes(value)

  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Resumen de asistencia"
    >
      <StatCard
        label="Registros totales"
        value={numberValue(summary?.totalRecords)}
        trend="Según los filtros seleccionados"
      />
      <StatCard
        label="Llegadas tarde"
        value={numberValue(summary?.lateCount)}
        trend="Puntualidad del período"
      />
      <StatCard
        label="Tiempo trabajado"
        value={minutesValue(summary?.totalWorkedMinutes)}
        trend="Minutos informados por el servidor"
      />
      <StatCard
        label="Ausencias"
        value={numberValue(summary?.absenceCount)}
        trend="Ausencias informadas por el servidor"
      />
    </section>
  )
}

function EmployeeStats({ summary }: { summary: EmployeeAttendanceSummary }) {
  return (
    <Card className="grid gap-3" aria-label={`Resumen de ${summary.fullName}`}>
      <div>
        <h2 className="m-0 text-lg font-bold">Resumen de {summary.fullName}</h2>
        <p className="m-0 text-sm text-text-muted">
          Estadísticas del empleado para los filtros actuales.
        </p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-sm text-text-muted">Asistencias</dt>
          <dd className="m-0 text-xl font-bold">{Number(summary.attendanceCount)}</dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Tiempo trabajado</dt>
          <dd className="m-0 text-xl font-bold">{formatDurationMinutes(summary.workedMinutes)}</dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Llegadas tarde</dt>
          <dd className="m-0 text-xl font-bold">{Number(summary.lateCount)}</dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Ausencias</dt>
          <dd className="m-0 text-xl font-bold">{Number(summary.absenceCount)}</dd>
        </div>
      </dl>
    </Card>
  )
}

function AttendanceDetail({ row }: { row: AdministrativeAttendanceRow }) {
  return (
    <dl className="grid gap-3 text-sm">
      <div className="flex flex-wrap justify-between gap-3">
        <dt className="text-text-muted">Empleado</dt>
        <dd className="m-0 text-right font-bold">{row.fullName}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <dt className="text-text-muted">Fecha de negocio</dt>
        <dd className="m-0 text-right font-bold">{formatBusinessDateShort(row.businessDate)}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <dt className="text-text-muted">Turno</dt>
        <dd className="m-0 text-right font-bold">{formatShift(row.shiftType)}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <dt className="text-text-muted">Horario planificado</dt>
        <dd className="m-0 text-right font-bold">
          {row.plannedStart && row.plannedEnd
            ? `${formatTime(row.plannedStart)} – ${formatTime(row.plannedEnd)}`
            : '—'}
        </dd>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <dt className="text-text-muted">Entrada</dt>
        <dd className="m-0 text-right font-bold">{formatNullableTime(row.checkInAt)}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <dt className="text-text-muted">Salida</dt>
        <dd className="m-0 text-right font-bold">{formatNullableTime(row.checkOutAt)}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <dt className="text-text-muted">Resultado</dt>
        <dd className="m-0 text-right font-bold">{formatOutcome(row.outcome)}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <dt className="text-text-muted">Puntualidad</dt>
        <dd className="m-0 text-right font-bold">{formatPunctuality(row)}</dd>
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <dt className="text-text-muted">Tiempo trabajado</dt>
        <dd className="m-0 text-right font-bold">{formatDurationMinutes(row.workedMinutes)}</dd>
      </div>
    </dl>
  )
}

function AttendanceTable({
  rows,
  onDetail,
}: {
  rows: AdministrativeAttendanceRow[]
  onDetail: (row: AdministrativeAttendanceRow) => void
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table
        className="w-full min-w-[70rem] border-collapse"
        aria-label="Asistencia administrativa"
      >
        <thead>
          <tr>
            {[
              'Empleado',
              'Fecha',
              'Turno',
              'Entrada',
              'Salida',
              'Resultado',
              'Puntualidad',
              'Trabajado',
              'Acciones',
            ].map((heading) => (
              <th key={heading} className="border-b border-border p-3 text-left" scope="col">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={attendanceRowKey(row, index)}>
              <td className="border-b border-border p-3 text-left">{row.fullName}</td>
              <td className="border-b border-border p-3 text-left">
                {formatBusinessDateShort(row.businessDate)}
              </td>
              <td className="border-b border-border p-3 text-left">{formatShift(row.shiftType)}</td>
              <td className="border-b border-border p-3 text-left">
                {formatNullableTime(row.checkInAt)}
              </td>
              <td className="border-b border-border p-3 text-left">
                {formatNullableTime(row.checkOutAt)}
              </td>
              <td className="border-b border-border p-3 text-left">
                <Badge tone={LIFECYCLE_META[row.outcome].tone}>{formatOutcome(row.outcome)}</Badge>
              </td>
              <td className="border-b border-border p-3 text-left">{formatPunctuality(row)}</td>
              <td className="border-b border-border p-3 text-left">
                {formatDurationMinutes(row.workedMinutes)}
              </td>
              <td className="border-b border-border p-3 text-left">
                <Button type="button" size="sm" variant="outline" onClick={() => onDetail(row)}>
                  Ver detalle
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AttendanceCards({
  rows,
  onDetail,
}: {
  rows: AdministrativeAttendanceRow[]
  onDetail: (row: AdministrativeAttendanceRow) => void
}) {
  return (
    <div className="grid gap-3 md:hidden">
      {rows.map((row, index) => (
        <Card key={attendanceRowKey(row, index)} className="grid min-w-0 gap-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <strong className="break-words">{row.fullName}</strong>
              <p className="m-0 text-sm text-text-muted">
                {formatBusinessDateShort(row.businessDate)}
              </p>
            </div>
            <Badge tone={LIFECYCLE_META[row.outcome].tone}>{formatOutcome(row.outcome)}</Badge>
          </div>
          <dl className="grid gap-1 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">Turno</dt>
              <dd className="m-0 text-right font-bold">{formatShift(row.shiftType)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">Entrada / salida</dt>
              <dd className="m-0 text-right font-bold">
                {formatNullableTime(row.checkInAt)} · {formatNullableTime(row.checkOutAt)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">Puntualidad</dt>
              <dd className="m-0 text-right font-bold">{formatPunctuality(row)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-text-muted">Trabajado</dt>
              <dd className="m-0 text-right font-bold">
                {formatDurationMinutes(row.workedMinutes)}
              </dd>
            </div>
          </dl>
          <Button type="button" size="sm" variant="outline" onClick={() => onDetail(row)}>
            Ver detalle
          </Button>
        </Card>
      ))}
    </div>
  )
}

function AttendancePagination({
  filters,
  totalCount,
  totalPages,
  onPageChange,
}: {
  filters: AdministrativeAttendanceFilters
  totalCount: number
  totalPages: number
  onPageChange: (page: number) => void
}) {
  const page = Number(filters.page)
  const pageSize = Number(filters.pageSize)
  const pages = Math.max(1, totalPages)
  const first = totalCount ? (page - 1) * pageSize + 1 : 0
  const last = Math.min(page * pageSize, totalCount)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-text-muted">
      <span>
        Mostrando {first}–{last} de {totalCount}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Página anterior de asistencia administrativa"
        >
          Anterior
        </Button>
        <span aria-live="polite">
          Página {page} de {pages}
        </span>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Página siguiente de asistencia administrativa"
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export function AdministrativeAttendancePage() {
  const { filters, updateFilters, setPage, clearFilters } = useAdministrativeAttendanceFilterState()
  const defaults = useMemo(() => createAdministrativeAttendanceFilters(), [])
  const attendance = useAttendanceAdmin(filters)
  const options = useAttendanceAdminOptions(filters)
  const [selectedRow, setSelectedRow] = useState<AdministrativeAttendanceRow | null>(null)

  const rows = attendance.data?.items ?? []
  const totalCount = Number(attendance.data?.totalCount ?? 0)
  const totalPages = Number(attendance.data?.totalPages ?? 1)
  const filtered = Boolean(
    filters.employeeId ||
    filters.shiftType ||
    filters.outcome ||
    filters.from !== defaults.from ||
    filters.to !== defaults.to,
  )
  const employeeSummaries = [
    ...(attendance.data?.employeeSummaries ?? []),
    ...(options.data?.employeeSummaries ?? []),
  ]
  const employeeOptions = Array.from(
    new Map(employeeSummaries.map((summary) => [summary.employeeId, summary])).values(),
  ).sort((left, right) => left.fullName.localeCompare(right.fullName, 'es'))
  const selectedEmployeeSummary = filters.employeeId
    ? employeeSummaries.find((summary) => summary.employeeId === filters.employeeId)
    : undefined

  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        title="Asistencia"
        description="Consulta los registros de asistencia del personal sin modificar sus datos."
        actions={
          <Link
            to="/mi-asistencia"
            className="font-bold text-brand-orange no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
          >
            Mi asistencia
          </Link>
        }
      />

      <SummaryCards summary={attendance.data?.summary} isLoading={attendance.isLoading} />

      <Card
        className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4"
        aria-label="Filtros de asistencia"
      >
        <FormField label="Empleado">
          <Select
            value={filters.employeeId ?? ''}
            disabled={options.isLoading && !employeeOptions.length}
            onChange={(event) =>
              updateFilter(updateFilters, 'employeeId', event.target.value || undefined)
            }
          >
            <option value="">Todos</option>
            {employeeOptions.map((employee) => (
              <option key={employee.employeeId} value={employee.employeeId}>
                {employee.fullName}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Desde">
          <Input
            type="date"
            value={filters.from ?? ''}
            onChange={(event) =>
              updateFilter(updateFilters, 'from', event.target.value || undefined)
            }
          />
        </FormField>
        <FormField label="Hasta">
          <Input
            type="date"
            value={filters.to ?? ''}
            onChange={(event) => updateFilter(updateFilters, 'to', event.target.value || undefined)}
          />
        </FormField>
        <FormField label="Turno">
          <Select
            value={filters.shiftType ?? ''}
            onChange={(event) =>
              updateFilter(
                updateFilters,
                'shiftType',
                (event.target.value || undefined) as ShiftType | undefined,
              )
            }
          >
            <option value="">Todos</option>
            {ATTENDANCE_SHIFT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Resultado">
          <Select
            value={filters.outcome ?? ''}
            onChange={(event) =>
              updateFilter(
                updateFilters,
                'outcome',
                (event.target.value || undefined) as AttendanceLifecycle | undefined,
              )
            }
          >
            <option value="">Todos</option>
            {ATTENDANCE_OUTCOME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="flex flex-wrap items-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setPage(1)}>
            Aplicar
          </Button>
          {filtered && (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              Limpiar al mes actual
            </Button>
          )}
        </div>
        {options.isError && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-warning" role="alert">
            <span>No se pudieron cargar las opciones de empleado.</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => void options.refetch()}>
              Reintentar opciones
            </Button>
          </div>
        )}
      </Card>

      {selectedEmployeeSummary && <EmployeeStats summary={selectedEmployeeSummary} />}

      {attendance.isLoading && !attendance.data ? (
        <Card className="grid gap-3" aria-busy="true">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </Card>
      ) : attendance.isError ? (
        <Alert kind="error" title="No se pudo cargar la asistencia administrativa">
          <span className="block">
            {errorMessage(attendance.error, 'No se pudo cargar la asistencia administrativa.')}
          </span>
          <Button
            type="button"
            className="mt-3"
            variant="outline"
            onClick={() => void attendance.refetch()}
          >
            Reintentar asistencia
          </Button>
        </Alert>
      ) : !rows.length ? (
        <Card>
          <EmptyState
            title={
              filtered ? 'No hay registros para estos filtros' : 'No hay registros de asistencia'
            }
          >
            {filtered
              ? 'No se encontraron registros dentro del período y filtros seleccionados.'
              : 'No hay registros de asistencia para el mes actual.'}
          </EmptyState>
          {filtered && (
            <div className="flex justify-center">
              <Button type="button" variant="outline" onClick={clearFilters}>
                Limpiar al mes actual
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="grid min-w-0 gap-4" aria-busy={attendance.isFetching}>
          <AttendanceTable rows={rows} onDetail={setSelectedRow} />
          <AttendanceCards rows={rows} onDetail={setSelectedRow} />
          <AttendancePagination
            filters={filters}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={setPage}
          />
          {attendance.isFetching && (
            <p className="m-0 text-sm text-text-muted" role="status">
              Actualizando asistencia…
            </p>
          )}
        </Card>
      )}

      <Modal
        open={selectedRow !== null}
        title="Detalle de asistencia"
        onClose={() => setSelectedRow(null)}
      >
        {selectedRow && <AttendanceDetail row={selectedRow} />}
      </Modal>

      <div className="flex items-center gap-2 text-sm text-text-muted">
        <RefreshCw aria-hidden={true} size={14} />
        <span>Los valores se consultan desde el servidor y son de solo lectura.</span>
      </div>
    </div>
  )
}
