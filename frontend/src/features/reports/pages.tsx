import { NavLink } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { Badge, Button, Card, Input, LinkButton, Select } from '@/components/atoms'
import { Alert, EmptyState, StatCard } from '@/components/molecules'
import { FormField } from '@/components/molecules/FormFields'
import { Modal, PageHeader } from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import { REPORT_NAVIGATION, hasReportAccess } from '@/features/navigation'
import type { SalesReportFilters, ShiftType } from './api'
import {
  SALES_CHANNELS,
  SHIFT_TYPES,
  hasInvalidDateRange,
  normalizeAttendanceReportFilters,
  normalizeSalesReportFilters,
  useAttendanceReport,
  useAttendanceReportFilterState,
  useInventoryReport,
  useSalesReport,
  useSalesReportFilterState,
  type AttendanceReport,
  type AttendanceReportItem,
  type InventoryReportItem,
  type SalesReport,
} from './api'
import {
  downloadReport,
  normalizeAttendanceReport,
  normalizeInventoryReport,
  normalizeSalesReport,
  type ExportFormat,
  type NormalizedReport,
} from './export'

const moneyFormatter = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' })
const integerFormatter = new Intl.NumberFormat('es-BO')

function numberValue(value: number | string) {
  return Number(value)
}

function money(value: number | string) {
  return moneyFormatter.format(numberValue(value))
}

function integer(value: number | string) {
  return integerFormatter.format(numberValue(value))
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}

export function ReportNavigation() {
  const { user } = useAuth()
  const roles = user?.roles ?? []
  const links = REPORT_NAVIGATION.filter((link) => hasReportAccess(roles, link.roles))

  return (
    <nav aria-label="Navegación de reportes">
      <ul className="flex flex-wrap gap-2 border-b border-border pb-3">
        {links.map((link) => (
          <li key={link.href}>
            <NavLink
              to={link.href}
              className={({ isActive }) =>
                `inline-flex min-h-10 items-center rounded-md px-3 py-2 text-sm font-bold no-underline transition-colors focus-visible:outline-2 focus-visible:outline-brand-orange ${isActive ? 'bg-brand-orange text-brand-black' : 'bg-surface-elevated text-text-muted hover:text-text'}`
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function ReportFrame({
  title,
  description,
  exportReportData,
  exportStale = false,
  children,
}: {
  title: string
  description: string
  exportReportData?: NormalizedReport
  exportStale?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid min-w-0 gap-6">
      <PageHeader
        title={title}
        description={description}
        actions={<ReportExportActions report={exportReportData} stale={exportStale} />}
      />
      <ReportNavigation />
      {children}
    </div>
  )
}

export function ReportExportActions({
  report,
  stale = false,
}: {
  report?: NormalizedReport
  stale?: boolean
}) {
  const [pending, setPending] = useState<ExportFormat>()
  const [error, setError] = useState(false)
  const disabled = stale || !report?.hasData || pending !== undefined

  function exportAs(format: ExportFormat) {
    if (!report) return
    setPending(format)
    setError(false)
    try {
      downloadReport(report, format)
    } catch {
      setError(true)
    } finally {
      setPending(undefined)
    }
  }

  return (
    <div className="grid justify-items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2" aria-label="Exportar reporte">
        {(['csv', 'xlsx', 'pdf'] as const).map((format) => (
          <Button
            key={format}
            size="sm"
            variant="outline"
            disabled={disabled}
            loading={pending === format}
            onClick={() => exportAs(format)}
          >
            {format.toUpperCase()}
          </Button>
        ))}
      </div>
      {stale ? (
        <small className="text-text-muted">Actualizando filtros…</small>
      ) : (
        !report?.hasData && <small className="text-text-muted">Sin datos para exportar</small>
      )}
      {error && <span role="alert">No se pudo generar el archivo.</span>}
    </div>
  )
}

function useMobileViewport() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  )

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return isMobile
}

function FilterFields({
  children,
  onClear,
  onClose,
}: {
  children: ReactNode
  onClear: () => void
  onClose?: () => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {children}
      <div className="flex items-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onClear()
            onClose?.()
          }}
        >
          Limpiar filtros
        </Button>
      </div>
    </div>
  )
}

export function ResponsiveFilterPanel({
  title,
  children,
  onClear,
}: {
  title: string
  children: ReactNode
  onClear: () => void
}) {
  const isMobile = useMobileViewport()
  const [open, setOpen] = useState(false)

  if (isMobile) {
    return (
      <>
        <div>
          <Button
            type="button"
            variant="outline"
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            Filtros
          </Button>
        </div>
        <Modal open={open} title={title} onClose={() => setOpen(false)}>
          <FilterFields onClear={onClear} onClose={() => setOpen(false)}>
            {children}
          </FilterFields>
        </Modal>
      </>
    )
  }

  return (
    <Card>
      <FilterFields onClear={onClear}>{children}</FilterFields>
    </Card>
  )
}

function QueryFeedback({
  loading,
  fetching,
  error,
  hasReport,
  isPlaceholder,
  onRetry,
  filtered,
}: {
  loading: boolean
  fetching: boolean
  error: unknown
  hasReport: boolean
  isPlaceholder: boolean
  onRetry: () => void
  filtered: boolean
}) {
  if (error) {
    return (
      <Card>
        <Alert kind="error" title="No se pudo actualizar el reporte">
          {hasReport
            ? 'Se mantiene la última respuesta válida. Reintenta para obtener los filtros actuales.'
            : 'Revisa tu conexión e inténtalo nuevamente.'}
        </Alert>
        <Button className="mt-4" variant="outline" onClick={onRetry}>
          Reintentar
        </Button>
      </Card>
    )
  }
  if (isPlaceholder) {
    return (
      <p className="text-sm text-text-muted" role="status">
        Consultando los filtros actuales…
      </p>
    )
  }
  if (loading && !hasReport) return <p role="status">Cargando reporte…</p>
  if (fetching && hasReport) {
    return (
      <p className="text-sm text-text-muted" role="status">
        Actualizando reporte…
      </p>
    )
  }
  if (!hasReport) {
    return (
      <Card>
        <EmptyState
          title={filtered ? 'No hay resultados para estos filtros.' : 'No hay datos todavía.'}
        >
          Ajusta el período o limpia los filtros para consultar nuevamente.
        </EmptyState>
      </Card>
    )
  }
  return null
}

function SalesTrend({ report }: { report: SalesReport }) {
  const series = report.series
  const max = Math.max(...series.map((item) => numberValue(item.totalAmount)), 1)
  return (
    <Card aria-labelledby="sales-trend-title" className="grid gap-4">
      <div>
        <h2 id="sales-trend-title">Tendencia de ventas</h2>
        <p className="m-0 text-sm text-text-muted">Importes por BusinessDate del reporte.</p>
      </div>
      {!series.length ? (
        <EmptyState title="Sin puntos de tendencia">
          No hay ventas en el período seleccionado.
        </EmptyState>
      ) : (
        <>
          <div
            className="flex min-h-48 items-end gap-2 overflow-x-auto border-b border-l border-border px-3 pt-4"
            role="img"
            aria-label={`Tendencia de ${series.length} días de negocio`}
          >
            {series.map((item) => {
              const amount = numberValue(item.totalAmount)
              const height = Math.max(8, (amount / max) * 100)
              return (
                <div
                  className="flex min-w-20 flex-1 flex-col items-center justify-end gap-2"
                  key={item.businessDate}
                >
                  <span className="text-xs font-bold">{money(amount)}</span>
                  <div
                    className="w-full rounded-t bg-brand-orange"
                    style={{ height: `${height}%` }}
                    title={`${dateLabel(item.businessDate)}: ${money(amount)}`}
                  />
                  <span className="text-center text-xs text-text-muted">
                    {dateLabel(item.businessDate)}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">Valores de la tendencia de ventas</caption>
              <thead>
                <tr>
                  <th className="border-b border-border p-2 text-left" scope="col">
                    BusinessDate
                  </th>
                  <th className="border-b border-border p-2 text-right" scope="col">
                    Ventas
                  </th>
                  <th className="border-b border-border p-2 text-right" scope="col">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {series.map((item) => (
                  <tr key={`table-${item.businessDate}`}>
                    <td className="border-b border-border p-2">{dateLabel(item.businessDate)}</td>
                    <td className="border-b border-border p-2 text-right">
                      {integer(item.salesCount)}
                    </td>
                    <td className="border-b border-border p-2 text-right">
                      {money(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  )
}

function SalesChannels({ report }: { report: SalesReport }) {
  const channels = [
    { name: 'DIRECT', label: 'Directo', value: numberValue(report.directTotal) },
    { name: 'PEDIDOSYA', label: 'PedidosYa', value: numberValue(report.pedidosYaTotal) },
  ]
  const total = Math.max(
    channels.reduce((sum, channel) => sum + channel.value, 0),
    1,
  )
  return (
    <Card aria-labelledby="sales-channels-title" className="grid gap-4">
      <div>
        <h2 id="sales-channels-title">Distribución por canal</h2>
        <p className="m-0 text-sm text-text-muted">Canales del mismo universo filtrado.</p>
      </div>
      <div className="grid gap-4">
        {channels.map((channel) => (
          <div className="grid gap-2" key={channel.name}>
            <div className="flex justify-between gap-3">
              <strong>{channel.label}</strong>
              <span>{money(channel.value)}</span>
            </div>
            <progress
              className="h-3 w-full accent-brand-orange"
              max={total}
              value={channel.value}
              aria-label={`${channel.label}: ${money(channel.value)}`}
            />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function SalesReportPage() {
  const { filters, updateFilters, clearFilters } = useSalesReportFilterState()
  const query = useSalesReport(filters)
  const invalid = hasInvalidDateRange(filters)
  const report = !invalid && !query.isPlaceholderData ? query.data : undefined
  const exportData = report
    ? normalizeSalesReport(report, normalizeSalesReportFilters(filters))
    : undefined
  return (
    <ReportFrame
      title="Reporte de ventas"
      description="Resumen de ventas confirmado por el backend y agrupado por fecha de negocio."
      exportReportData={exportData}
      exportStale={query.isPlaceholderData}
    >
      <ResponsiveFilterPanel title="Filtros de ventas" onClear={clearFilters}>
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
        <FormField label="Turno">
          <Select
            value={filters.shiftType ?? ''}
            onChange={(event) =>
              updateFilters({
                shiftType: (event.target.value || undefined) as ShiftType | undefined,
              })
            }
          >
            <option value="">Todos</option>
            {SHIFT_TYPES.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Canal">
          <Select
            value={filters.salesChannel ?? ''}
            onChange={(event) =>
              updateFilters({
                salesChannel: (event.target.value ||
                  undefined) as SalesReportFilters['salesChannel'],
              })
            }
          >
            <option value="">Todos</option>
            {SALES_CHANNELS.map((channel) => (
              <option key={channel} value={channel}>
                {channel === 'DIRECT' ? 'Directo' : 'PedidosYa'}
              </option>
            ))}
          </Select>
        </FormField>
      </ResponsiveFilterPanel>
      {invalid && (
        <Alert kind="warning" title="Período inválido">
          La fecha desde debe ser anterior o igual a la fecha hasta.
        </Alert>
      )}
      {!invalid && (
        <QueryFeedback
          loading={query.isLoading}
          fetching={query.isFetching}
          error={query.error}
          hasReport={Boolean(report)}
          isPlaceholder={query.isPlaceholderData}
          onRetry={() => void query.refetch()}
          filtered={Boolean(filters.shiftType || filters.salesChannel)}
        />
      )}
      {report && (
        <>
          <section
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-label="Resumen de ventas"
          >
            <StatCard label="Total vendido" value={money(report.totalAmount)} />
            <StatCard label="Efectivo" value={money(report.cashTotal)} />
            <StatCard label="QR" value={money(report.qrTotal)} />
            <StatCard label="Pago externo" value={money(report.externalTotal)} />
          </section>
          <div className="grid gap-6 xl:grid-cols-2">
            <SalesTrend report={report} />
            <SalesChannels report={report} />
          </div>
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0">Historial de ventas</h2>
              <p className="m-0 text-sm text-text-muted">
                Consulta el detalle transaccional en HU-015.
              </p>
            </div>
            <LinkButton href="/historial-ventas" variant="outline">
              Ver historial de ventas
            </LinkButton>
          </Card>
        </>
      )}
    </ReportFrame>
  )
}

function inventoryState(state: string) {
  if (state === 'NEGATIVE') return { label: 'Saldo negativo', tone: 'danger' as const }
  if (state === 'LOW') return { label: 'Stock bajo', tone: 'warning' as const }
  if (state === 'NORMAL') return { label: 'En stock', tone: 'success' as const }
  return { label: state, tone: 'neutral' as const }
}

function InventoryRows({ items }: { items: InventoryReportItem[] }) {
  if (!items.length) {
    return <EmptyState title="Sin existencias">No hay productos para mostrar.</EmptyState>
  }
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {['Producto', 'Cantidad', 'Unidad', 'Stock mínimo', 'Estado'].map((label) => (
                <th className="border-b border-border p-3 text-left" key={label} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const state = inventoryState(item.stockState)
              return (
                <tr key={item.productId}>
                  <td className="border-b border-border p-3 font-bold">{item.productName}</td>
                  <td
                    className={`border-b border-border p-3 ${numberValue(item.quantity) < 0 ? 'text-danger' : ''}`}
                  >
                    {numberValue(item.quantity)}
                  </td>
                  <td className="border-b border-border p-3">{item.unitSymbol}</td>
                  <td className="border-b border-border p-3">
                    {item.minStock === null ? '—' : numberValue(item.minStock)}
                  </td>
                  <td className="border-b border-border p-3">
                    <Badge tone={state.tone}>{state.label}</Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {items.map((item) => {
          const state = inventoryState(item.stockState)
          return (
            <Card
              key={item.productId}
              className={numberValue(item.quantity) < 0 ? 'border-danger' : ''}
            >
              <div className="flex flex-wrap justify-between gap-2">
                <strong>{item.productName}</strong>
                <Badge tone={state.tone}>{state.label}</Badge>
              </div>
              <p
                className={`my-3 text-2xl font-bold ${numberValue(item.quantity) < 0 ? 'text-danger' : ''}`}
              >
                {numberValue(item.quantity)}{' '}
                <span className="text-base font-normal">{item.unitSymbol}</span>
              </p>
              <span className="text-sm text-text-muted">
                Stock mínimo: {item.minStock === null ? '—' : numberValue(item.minStock)}
              </span>
            </Card>
          )
        })}
      </div>
    </>
  )
}

export function InventoryReportPage() {
  const query = useInventoryReport()
  const report = !query.isPlaceholderData ? query.data : undefined
  const exportData = report ? normalizeInventoryReport(report) : undefined
  return (
    <ReportFrame
      title="Reporte de inventario"
      description="Snapshot actual de existencias y estados de stock entregado por el backend."
      exportReportData={exportData}
      exportStale={query.isPlaceholderData}
    >
      <QueryFeedback
        loading={query.isLoading}
        fetching={query.isFetching}
        error={query.error}
        hasReport={Boolean(report)}
        isPlaceholder={query.isPlaceholderData}
        onRetry={() => void query.refetch()}
        filtered={false}
      />
      {report && (
        <>
          <section className="grid gap-4 sm:grid-cols-3" aria-label="Resumen de inventario">
            <StatCard label="Total de productos" value={integer(report.totalCount)} />
            <StatCard label="Stock bajo" value={integer(report.lowCount)} />
            <StatCard label="Saldo negativo" value={integer(report.negativeCount)} />
          </section>
          <Card aria-labelledby="inventory-items-title" className="grid gap-4">
            <h2 id="inventory-items-title">Existencias</h2>
            <InventoryRows items={report.items} />
          </Card>
        </>
      )}
    </ReportFrame>
  )
}

export function attendanceHistoryHref() {
  return '/asistencia'
}

function AttendanceRows({ items }: { items: AttendanceReportItem[] }) {
  if (!items.length) {
    return (
      <EmptyState title="Sin registros">
        No hay registros de asistencia para estos filtros.
      </EmptyState>
    )
  }
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {[
                'Empleado',
                'Asistencias',
                'Tarde',
                'Ausencias',
                'Horas',
                'Tarifa',
                'Pago proyectado',
                'Detalle',
              ].map((label) => (
                <th className="border-b border-border p-3 text-left" key={label} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.employeeId}>
                <td className="border-b border-border p-3 font-bold">{item.fullName}</td>
                <td className="border-b border-border p-3">{integer(item.attendanceCount)}</td>
                <td className="border-b border-border p-3">{integer(item.lateCount)}</td>
                <td className="border-b border-border p-3">{integer(item.absenceCount)}</td>
                <td className="border-b border-border p-3">
                  {numberValue(item.workedHours).toFixed(2)} h
                </td>
                <td className="border-b border-border p-3">{money(item.hourlyRate)}</td>
                <td className="border-b border-border p-3">{money(item.projectedPay)}</td>
                <td className="border-b border-border p-3">
                  <LinkButton href={attendanceHistoryHref()} variant="ghost">
                    Ver asistencia
                  </LinkButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {items.map((item) => (
          <Card key={item.employeeId} className="grid gap-2">
            <div className="flex flex-wrap justify-between gap-2">
              <strong>{item.fullName}</strong>
              <span>{money(item.projectedPay)}</span>
            </div>
            <span>Asistencias: {integer(item.attendanceCount)}</span>
            <span>Llegadas tarde: {integer(item.lateCount)}</span>
            <span>Ausencias: {integer(item.absenceCount)}</span>
            <span>Tiempo trabajado: {numberValue(item.workedHours).toFixed(2)} h</span>
            <span>Tarifa por hora: {money(item.hourlyRate)}</span>
            <LinkButton href={attendanceHistoryHref()} variant="ghost">
              Ver asistencia
            </LinkButton>
          </Card>
        ))}
      </div>
    </>
  )
}

function AttendanceSummary({ report }: { report: AttendanceReport }) {
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      aria-label="Resumen de asistencia"
    >
      <StatCard label="Asistencias" value={integer(report.summary.attendanceCount)} />
      <StatCard label="Minutos trabajados" value={integer(report.summary.totalWorkedMinutes)} />
      <StatCard
        label="Horas trabajadas"
        value={`${numberValue(report.summary.workedHours).toFixed(2)} h`}
      />
      <StatCard label="Llegadas tarde" value={integer(report.summary.lateCount)} />
      <StatCard
        label="Ausencias"
        value={integer(report.summary.absenceCount)}
        trend={`Pago proyectado: ${money(report.summary.projectedPay)}`}
      />
    </section>
  )
}

export function AttendanceReportPage() {
  const { filters, updateFilters, clearFilters } = useAttendanceReportFilterState()
  const query = useAttendanceReport(filters)
  const optionFilters = { ...filters, employeeId: undefined }
  const optionsQuery = useAttendanceReport(optionFilters)
  const invalid = hasInvalidDateRange(filters)
  const report = !invalid && !query.isPlaceholderData ? query.data : undefined
  const exportData = report
    ? normalizeAttendanceReport(report, normalizeAttendanceReportFilters(filters))
    : undefined
  const employeeOptions = (optionsQuery.data?.items ?? report?.items ?? []).filter(
    (item, index, values) =>
      values.findIndex((candidate) => candidate.employeeId === item.employeeId) === index,
  )
  return (
    <ReportFrame
      title="Reporte de asistencia"
      description="Analítica por empleado con reglas de asistencia y pago autoritativas del backend."
      exportReportData={exportData}
      exportStale={query.isPlaceholderData}
    >
      <ResponsiveFilterPanel title="Filtros de asistencia" onClear={clearFilters}>
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
        <FormField label="Empleado">
          <Select
            value={filters.employeeId ?? ''}
            onChange={(event) => updateFilters({ employeeId: event.target.value || undefined })}
          >
            <option value="">Todos</option>
            {employeeOptions.map((employee) => (
              <option key={employee.employeeId} value={employee.employeeId}>
                {employee.fullName}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Turno">
          <Select
            value={filters.shiftType ?? ''}
            onChange={(event) =>
              updateFilters({
                shiftType: (event.target.value || undefined) as ShiftType | undefined,
              })
            }
          >
            <option value="">Todos</option>
            {SHIFT_TYPES.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </Select>
        </FormField>
      </ResponsiveFilterPanel>
      {invalid && (
        <Alert kind="warning" title="Período inválido">
          La fecha desde debe ser anterior o igual a la fecha hasta.
        </Alert>
      )}
      {!invalid && (
        <QueryFeedback
          loading={query.isLoading}
          fetching={query.isFetching}
          error={query.error}
          hasReport={Boolean(report)}
          isPlaceholder={query.isPlaceholderData}
          onRetry={() => void query.refetch()}
          filtered={Boolean(filters.employeeId || filters.shiftType)}
        />
      )}
      {report && (
        <>
          <AttendanceSummary report={report} />
          <Card aria-labelledby="attendance-items-title" className="grid gap-4">
            <h2 id="attendance-items-title">Resumen por empleado</h2>
            <AttendanceRows items={report.items} />
          </Card>
        </>
      )}
    </ReportFrame>
  )
}
