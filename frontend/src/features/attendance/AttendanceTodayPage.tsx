import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Skeleton, Spinner, StatusDot } from '../../components/atoms'
import { Alert, EmptyState, StatCard } from '../../components/molecules'
import { DataTable, PageHeader, type DataTableColumn } from '../../components/organisms'
import { AppShell } from '../../components/templates'
import { HttpError } from '../../lib/api/http-client'
import type { AttendanceTodayItem } from './api'
import { useAttendanceToday, useCheckIn, useCheckOut } from './hooks'
import { errorMessage, formatTime, recordDuration } from './format'

const STATE_META: Record<string, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  OPEN: { label: 'Abierta', tone: 'success' },
  CLOSED: { label: 'Cerrada', tone: 'neutral' },
  NO_RECORD: { label: 'Sin registro', tone: 'warning' },
}

function stateMeta(state: string) {
  return STATE_META[state] ?? STATE_META.NO_RECORD
}

function RecordsList({ records }: { records: AttendanceTodayItem['attendanceRecords'] }) {
  if (!records.length) return <span className="text-text-muted">—</span>
  return (
    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {records.map((record) => (
        <li
          key={record.id}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-[0.8rem]"
          title={`Entrada ${formatTime(record.checkInAt)} · Salida ${record.checkOutAt ? formatTime(record.checkOutAt) : 'en curso'}`}
        >
          <span>{formatTime(record.checkInAt)}</span>
          <span aria-hidden="true" className="text-text-muted">→</span>
          <span>{record.checkOutAt ? formatTime(record.checkOutAt) : '…'}</span>
          <span className="text-text-muted">({recordDuration(record)})</span>
        </li>
      ))}
    </ul>
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

  const columns: DataTableColumn<AttendanceTodayItem>[] = [
    {
      id: 'fullName',
      header: 'Empleado',
      cell: (row) => (
        <span className={row.isActive ? '' : 'text-text-muted'}>
          {row.fullName}
          {!row.isActive && <Badge tone="warning"> Inactivo</Badge>}
        </span>
      ),
    },
    {
      id: 'state',
      header: 'Estado',
      cell: (row) => {
        const meta = stateMeta(row.currentState)
        return <StatusDot tone={meta.tone} label={meta.label} />
      },
    },
    {
      id: 'records',
      header: 'Ciclos de hoy',
      cell: (row) => <RecordsList records={row.attendanceRecords} />,
    },
    {
      id: 'actions',
      header: 'Acción',
      cell: (row) => {
        if (row.currentState === 'OPEN') {
          return (
            <Button
              size="sm"
              variant="danger"
              loading={checkOut.isPending && checkOut.variables === row.employeeId}
              onClick={() => checkOut.mutate(row.employeeId)}
            >
              Marcar salida
            </Button>
          )
        }
        return (
          <Button
            size="sm"
            disabled={!row.isActive}
            title={row.isActive ? undefined : 'Empleado inactivo'}
            loading={checkIn.isPending && checkIn.variables === row.employeeId}
            onClick={() => checkIn.mutate(row.employeeId)}
          >
            Marcar entrada
          </Button>
        )
      },
    },
  ]

  return (
    <AppShell
      navigation={<Link to="/inicio">← Inicio</Link>}
      header={
        <PageHeader
          title="Asistencia del día"
          description={
            today.data
              ? `Fecha de negocio ${today.data.businessDate} · ${today.data.timeZone}`
              : 'Marca la entrada y salida del personal.'
          }
          actions={
            <Button variant="secondary" size="sm" loading={today.isFetching} onClick={() => void today.refetch()}>
              Actualizar
            </Button>
          }
        />
      }
    >
      {(checkIn.isPending || checkOut.isPending) && <Spinner label="Registrando asistencia" />}

      {mutationError && (
        <Alert kind="error" title="No se pudo registrar">
          {mutationError instanceof HttpError
            ? (mutationError.problem.detail ?? mutationError.problem.title ?? 'Error inesperado.')
            : 'Error inesperado.'}
        </Alert>
      )}
      {showSuccess && !mutationError && lastSuccess && (
        <Alert kind="success" title="Asistencia actualizada">
          Entrada a las {formatTime(lastSuccess.checkInAt)}
          {lastSuccess.checkOutAt
            ? ` · salida a las ${formatTime(lastSuccess.checkOutAt)}.`
            : ' · ciclo abierto en curso.'}
        </Alert>
      )}

      {today.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Personal activo" value={activeCount} trend={`${items.length} en total`} />
            <StatCard label="Ciclos abiertos" value={openCount} trend="Trabajando ahora" />
            <StatCard label="Ciclos cerrados hoy" value={closedCount} trend="Turno completado" />
          </div>

          <section aria-label="Personal del día" className="rounded-lg border border-border bg-surface p-4">
            {items.length === 0 ? (
              <EmptyState title="Sin personal registrado">
                No hay empleados cargados todavía. Coordina con administración.
              </EmptyState>
            ) : (
              <DataTable columns={columns} rows={items} getRowId={(row) => row.employeeId} />
            )}
          </section>
        </>
      )}

      {today.isError && (
        <Alert kind="error" title="No se pudo cargar la asistencia">
          {errorMessage(today.error)}
        </Alert>
      )}
    </AppShell>
  )
}
