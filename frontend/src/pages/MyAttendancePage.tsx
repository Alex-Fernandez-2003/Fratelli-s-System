import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Input, Label, Spinner } from '../components/atoms'
import { Alert, Pagination } from '../components/molecules'
import { DataTable, PageHeader, type DataTableColumn } from '../components/organisms'
import { AppShell } from '../components/templates'
import { useAuth } from '../features/auth/AuthProvider'
import type { AttendanceRecordDto } from '../features/attendance/api'
import { useMyAttendance } from '../features/attendance/hooks'

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function duration(record: AttendanceRecordDto): string {
  if (!record.checkOutAt) return 'En curso'
  const ms = new Date(record.checkOutAt).getTime() - new Date(record.checkInAt).getTime()
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  return `${hours}h ${minutes}m`
}

const columns: DataTableColumn<AttendanceRecordDto>[] = [
  { id: 'businessDate', header: 'Fecha', cell: (row) => row.businessDate },
  { id: 'checkInAt', header: 'Entrada', cell: (row) => formatDateTime(row.checkInAt) },
  {
    id: 'checkOutAt',
    header: 'Salida',
    cell: (row) => (row.checkOutAt ? formatDateTime(row.checkOutAt) : '—'),
  },
  { id: 'duration', header: 'Duración', cell: (row) => duration(row) },
  {
    id: 'status',
    header: 'Estado',
    cell: (row) =>
      row.checkOutAt ? <Badge>Cerrada</Badge> : <Badge tone="success">Abierta</Badge>,
  },
]

export function MyAttendancePage() {
  const { user } = useAuth()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const history = useMyAttendance({ from: from || undefined, to: to || undefined, page })

  return (
    <AppShell
      navigation={<Link to="/inicio">← Inicio</Link>}
      header={
        <PageHeader
          title="Mi asistencia"
          description={`Historial de ${user?.fullName ?? user?.username ?? ''}`}
        />
      }
    >
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault()
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
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      {history.isLoading && <Spinner label="Cargando historial" />}
      {history.isError && (
        <Alert kind="error">
          {history.error instanceof HttpError
            ? (history.error.problem.detail ?? 'No se pudo cargar el historial.')
            : 'No se pudo cargar el historial.'}
        </Alert>
      )}
      {history.data && (
        <>
          <DataTable
            columns={columns}
            rows={history.data.items}
            getRowId={(row) => row.id}
            emptyMessage="Sin registros de asistencia."
          />
          {Number(history.data.totalPages) > 1 && (
            <Pagination
              page={Number(history.data.page)}
              pageCount={Number(history.data.totalPages)}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </AppShell>
  )
}
