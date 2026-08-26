import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Button, Input, Label, Skeleton } from '../components/atoms'
import { Alert, EmptyState, Pagination, StatCard } from '../components/molecules'
import { DataTable, PageHeader, type DataTableColumn } from '../components/organisms'
import { AppShell } from '../components/templates'
import { useAuth } from '../features/auth/AuthProvider'
import type { AttendanceRecordDto } from '../features/attendance/api'
import { useMyAttendance } from '../features/attendance/hooks'
import { errorMessage, formatDateTime, recordDuration, totalDuration } from '../features/attendance/format'

const columns: DataTableColumn<AttendanceRecordDto>[] = [
  { id: 'businessDate', header: 'Fecha', cell: (row) => row.businessDate },
  { id: 'checkInAt', header: 'Entrada', cell: (row) => formatDateTime(row.checkInAt) },
  {
    id: 'checkOutAt',
    header: 'Salida',
    cell: (row) => (row.checkOutAt ? formatDateTime(row.checkOutAt) : <span className="text-text-muted">—</span>),
  },
  {
    id: 'duration',
    header: 'Duración',
    cell: (row) => (
      <span className={row.checkOutAt ? '' : 'text-text-muted'}>{recordDuration(row)}</span>
    ),
  },
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
  const filters = useMemo(
    () => ({ from: from || undefined, to: to || undefined, page }),
    [from, to, page],
  )
  const history = useMyAttendance(filters)

  const items = history.data?.items ?? []
  const totalCount = Number(history.data?.totalCount ?? 0)
  const totalPages = Number(history.data?.totalPages ?? 0)
  const openCount = items.filter((r) => !r.checkOutAt).length

  const hasFilters = Boolean(from || to)

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
      {history.isError && (
        <Alert kind="error" title="No se pudo cargar el historial">
          {errorMessage(history.error)}
        </Alert>
      )}

      <form
        className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4"
        onSubmit={(event) => {
          event.preventDefault()
          setPage(1)
        }}
        aria-label="Filtros de historial"
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
          Aplicar
        </Button>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
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
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : (
        !history.isError && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Registros del período" value={totalCount} trend={`Página ${page}${totalPages ? ` de ${totalPages}` : ''}`} />
              <StatCard label="Horas acumuladas" value={totalDuration(items)} trend="Ciclos cerrados en esta página" />
              <StatCard label="Ciclos abiertos" value={openCount} trend="En curso ahora" />
            </div>

            <section aria-label="Historial de asistencia" className="rounded-lg border border-border bg-surface p-4">
              {items.length === 0 ? (
                <EmptyState title="Sin registros de asistencia">
                  {hasFilters
                    ? 'No hay registros en el rango seleccionado. Prueba con otras fechas.'
                    : 'Aún no tienes entradas o salidas registradas.'}
                </EmptyState>
              ) : (
                <>
                  <DataTable
                    columns={columns}
                    rows={items}
                    getRowId={(row) => row.id}
                  />
                  {totalPages > 1 && (
                    <div className="mt-4">
                      <Pagination page={page} pageCount={totalPages} onPageChange={setPage} />
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )
      )}
    </AppShell>
  )
}
