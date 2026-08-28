import { useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import { Badge, Button, Input, Label, Skeleton } from '../components/atoms'
import { Alert, EmptyState } from '../components/molecules'
import type { AttendanceRecordDto } from '../features/attendance/api'
import { useMyAttendance } from '../features/attendance/hooks'
import {
  errorMessage,
  formatDayShort,
  formatTime,
  recordDuration,
  totalDuration,
} from '../features/attendance/format'

function HistoryItem({ record }: { record: AttendanceRecordDto }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-4">
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-sm font-bold">{formatDayShort(record.checkInAt)}</p>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span>{formatTime(record.checkInAt)}</span>
          {record.checkOutAt && <span>{formatTime(record.checkOutAt)}</span>}
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
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(1)
  const filters = useMemo(
    () => ({ from: from || undefined, to: to || undefined, page }),
    [from, to, page],
  )
  const history = useMyAttendance(filters)
  const items = history.data?.items ?? []
  const closedRecords = items.filter((record) => record.checkOutAt)
  const hasFilters = Boolean(from || to)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Mi asistencia</h1>
        <p className="text-sm text-text-muted">Consulta tu historial de asistencia registrado.</p>
      </header>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Clock aria-hidden={true} size={18} className="text-text-muted" />
            Historial reciente
          </h2>
        </div>
        <form
          className="mb-4 flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
          }}
        >
          <div>
            <Label htmlFor="from">Desde</Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="to">Hasta</Label>
            <Input id="to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
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
              : 'Tu historial aparecerá aquí cuando sea registrado por un administrador o encargado.'}
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
  )
}
