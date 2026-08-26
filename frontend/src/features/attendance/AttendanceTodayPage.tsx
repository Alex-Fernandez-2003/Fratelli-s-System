import { Link } from 'react-router-dom'
import { Badge, Button, Spinner } from '../../components/atoms'
import { Alert } from '../../components/molecules'
import { DataTable, PageHeader, type DataTableColumn } from '../../components/organisms'
import { AppShell } from '../../components/templates'
import { HttpError } from '../../lib/api/http-client'
import type { AttendanceTodayItem } from './api'
import { useAttendanceToday, useCheckIn, useCheckOut } from './hooks'

const STATE_LABEL: Record<string, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  OPEN: { label: 'Abierta', tone: 'success' },
  CLOSED: { label: 'Cerrada', tone: 'neutral' },
  NO_RECORD: { label: 'Sin registro', tone: 'warning' },
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
}

function errorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    return error.problem.detail ?? error.problem.title ?? 'Error inesperado.'
  }
  return 'No se pudo completar la operación.'
}

function RecordsList({ records }: { records: AttendanceTodayItem['attendanceRecords'] }) {
  if (!records.length) return <span className="text-text-muted">—</span>
  return (
    <ul className="m-0 list-none space-y-0.5 p-0">
      {records.map((record) => (
        <li key={record.id}>
          {formatTime(record.checkInAt)}
          {' → '}
          {record.checkOutAt ? formatTime(record.checkOutAt) : '…'}
        </li>
      ))}
    </ul>
  )
}

export function AttendanceTodayPage() {
  const today = useAttendanceToday(true)
  const checkIn = useCheckIn()
  const checkOut = useCheckOut()
  const mutationError = checkIn.error ?? checkOut.error

  const columns: DataTableColumn<AttendanceTodayItem>[] = [
    { id: 'fullName', header: 'Empleado', cell: (row) => row.fullName },
    {
      id: 'state',
      header: 'Estado',
      cell: (row) => {
        const state = STATE_LABEL[row.currentState] ?? STATE_LABEL.NO_RECORD
        return <Badge tone={state.tone}>{state.label}</Badge>
      },
    },
    {
      id: 'records',
      header: 'Registros de hoy',
      cell: (row) => <RecordsList records={row.attendanceRecords} />,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: (row) =>
        row.currentState === 'OPEN' ? (
          <Button
            size="sm"
            variant="danger"
            loading={checkOut.isPending && checkOut.variables === row.employeeId}
            onClick={() => checkOut.mutate(row.employeeId)}
          >
            Marcar salida
          </Button>
        ) : (
          <Button
            size="sm"
            loading={checkIn.isPending && checkIn.variables === row.employeeId}
            onClick={() => checkIn.mutate(row.employeeId)}
          >
            Marcar entrada
          </Button>
        ),
    },
  ]

  return (
    <AppShell
      navigation={<Link to="/inicio">← Inicio</Link>}
      header={
        <PageHeader
          title="Asistencia del día"
          description="Marca la entrada y salida del personal."
        />
      }
    >
      {today.isLoading && <Spinner label="Cargando asistencia" />}
      {today.isError && <Alert kind="error">{errorMessage(today.error)}</Alert>}
      {mutationError && <Alert kind="error">{errorMessage(mutationError)}</Alert>}
      {today.data && (
        <p className="text-text-muted">
          Fecha de negocio: {today.data.businessDate} · Zona horaria: {today.data.timeZone}
        </p>
      )}
      {today.data && (
        <DataTable columns={columns} rows={today.data.items} getRowId={(row) => row.employeeId} />
      )}
    </AppShell>
  )
}
