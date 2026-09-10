import { ArrowRight, BarChart3, CheckCircle2, Clock, Package, Users, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Badge, Button, Card, StatusDot } from '../components/atoms'
import { useAuth } from '../features/auth/AuthProvider'
import { useAttendanceCurrent } from '../features/attendance/hooks'
import { useCashPreview } from '../features/cash/api'
import { createCashClosingHistoryFilters, useCashClosingHistory } from '../features/cash/api'
import { useCommands } from '../features/kitchen/api'
import { useInventorySummary } from '../features/inventory/api'
import { ATTENDANCE_ADMIN_ROLES } from '../features/navigation'

const money = (value: number | string | null | undefined) =>
  value == null
    ? '—'
    : new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB' }).format(Number(value))

const roleLinks: Record<string, { label: string; description: string; href: string }[]> = {
  ADMINISTRADOR: [
    { label: 'Pedidos', description: 'Revisá el flujo operativo.', href: '/pedidos' },
    { label: 'Cocina', description: 'Supervisá las comandas del día.', href: '/cocina' },
    { label: 'Inventario', description: 'Consultá existencias y alertas.', href: '/inventario' },
    { label: 'Turnos / Caja', description: 'Controlá la jornada activa.', href: '/turnos' },
    {
      label: 'Asistencia de hoy',
      description: 'Gestioná la asistencia del equipo.',
      href: '/asistencia/hoy',
    },
  ],
  ENCARGADO: [
    { label: 'Pedidos', description: 'Revisá el flujo operativo.', href: '/pedidos' },
    { label: 'Cocina', description: 'Supervisá las comandas del día.', href: '/cocina' },
    { label: 'Inventario', description: 'Consultá existencias y alertas.', href: '/inventario' },
    { label: 'Turnos / Caja', description: 'Controlá la jornada activa.', href: '/turnos' },
    {
      label: 'Asistencia de hoy',
      description: 'Gestioná la asistencia del equipo.',
      href: '/asistencia/hoy',
    },
  ],
  MESERO: [
    { label: 'Nuevo pedido', description: 'Registrá una orden de mesa.', href: '/pedidos/nuevo' },
    { label: 'Cocina', description: 'Consultá el estado de tus comandas.', href: '/cocina' },
    { label: 'Mi turno', description: 'Revisá tu asignación actual.', href: '/mi-turno' },
    {
      label: 'Historial de ventas',
      description: 'Consultá ventas dentro de tu alcance.',
      href: '/historial-ventas',
    },
  ],
  COCINA: [
    { label: 'Cocina', description: 'Trabajá la cola operativa del día.', href: '/cocina' },
    {
      label: 'Registrar producción',
      description: 'Registrá una producción real.',
      href: '/produccion/registrar',
    },
    { label: 'Producción', description: 'Consultá lotes y consumos.', href: '/produccion' },
    { label: 'Inventario', description: 'Revisá existencias de cocina.', href: '/inventario' },
  ],
  CONTADORA: [
    {
      label: 'Historial de gastos',
      description: 'Consultá egresos persistidos.',
      href: '/gastos/historial',
    },
    {
      label: 'Cierres de caja',
      description: 'Revisá cierres registrados.',
      href: '/turnos/cierres',
    },
    {
      label: 'Reporte de ventas',
      description: 'Consultá ventas por fecha de negocio.',
      href: '/reportes/ventas',
    },
    {
      label: 'Reporte de asistencia',
      description: 'Consultá la proyección disponible.',
      href: '/reportes/asistencia',
    },
  ],
  EMPLEADO: [
    { label: 'Mi asistencia', description: 'Registrá entrada y salida.', href: '/mi-asistencia' },
  ],
}

function QuickLink({
  label,
  description,
  href,
}: {
  label: string
  description: string
  href: string
}) {
  return (
    <Link
      to={href}
      className="group flex min-h-20 items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 no-underline transition-colors hover:border-brand-orange hover:bg-surface-elevated"
    >
      <span className="min-w-0">
        <strong className="block text-sm">{label}</strong>
        <span className="block text-xs text-text-muted">{description}</span>
      </span>
      <ArrowRight aria-hidden="true" size={18} className="shrink-0 text-brand-orange" />
    </Link>
  )
}

function AttendanceWidget() {
  const current = useAttendanceCurrent()
  const lifecycle = current.data?.lifecycle
  const label =
    lifecycle === 'OPEN'
      ? 'Entrada abierta'
      : lifecycle === 'CLOSED'
        ? 'Registro cerrado'
        : lifecycle === 'ABSENT'
          ? 'Ausencia registrada'
          : lifecycle === 'NO_ASSIGNMENT'
            ? 'Sin asignación'
            : 'Sin entrada'
  const tone = lifecycle === 'OPEN' ? 'success' : lifecycle === 'CLOSED' ? 'neutral' : 'warning'

  return (
    <Card className="grid gap-3" aria-labelledby="dashboard-attendance-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="dashboard-attendance-title" className="m-0 text-base font-bold">
            Mi asistencia
          </h2>
          <p className="m-0 text-sm text-text-muted">Estado autoritativo de la fecha operativa.</p>
        </div>
        <Clock aria-hidden="true" size={19} className="text-brand-orange" />
      </div>
      {current.isLoading ? (
        <p role="status" className="m-0 text-sm text-text-muted">
          Consultando asistencia…
        </p>
      ) : current.error ? (
        <p role="alert" className="m-0 text-sm text-warning">
          No se pudo consultar el estado actual.
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusDot label={label} tone={tone} />
          <Link to="/mi-asistencia" className="text-sm font-bold text-brand-orange">
            Ver mi asistencia
          </Link>
        </div>
      )}
    </Card>
  )
}

function OperationsWidget() {
  const cash = useCashPreview()
  const inventory = useInventorySummary()
  return (
    <Card className="grid gap-4" aria-labelledby="dashboard-operations-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="dashboard-operations-title" className="m-0 text-base font-bold">
            Resumen operativo
          </h2>
          <p className="m-0 text-sm text-text-muted">
            Datos reales de la jornada y del inventario.
          </p>
        </div>
        <Wallet aria-hidden="true" size={19} className="text-brand-orange" />
      </div>
      <dl className="grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-text-muted">Efectivo esperado</dt>
          <dd className="m-0 text-lg font-bold">{money(cash.data?.expectedCash)}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Ventas del día</dt>
          <dd className="m-0 text-lg font-bold">{money(cash.data?.salesTotal)}</dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Stock bajo</dt>
          <dd className="m-0 text-lg font-bold">{inventory.data?.lowStockCount ?? '—'}</dd>
        </div>
      </dl>
      {(cash.error || inventory.error) && (
        <p role="alert" className="m-0 text-sm text-warning">
          Algunos datos operativos no están disponibles.
        </p>
      )}
    </Card>
  )
}

function KitchenWidget() {
  const pending = useCommands({ page: 1, pageSize: 100, status: 'PENDIENTE' })
  return (
    <Card className="grid gap-3" aria-labelledby="dashboard-kitchen-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="dashboard-kitchen-title" className="m-0 text-base font-bold">
            Cocina
          </h2>
          <p className="m-0 text-sm text-text-muted">Comandas pendientes del día actual.</p>
        </div>
        <Package aria-hidden="true" size={19} className="text-brand-orange" />
      </div>
      <strong className="text-2xl">{pending.data?.totalCount ?? '—'}</strong>
      {pending.error && (
        <p role="alert" className="m-0 text-sm text-warning">
          No se pudo consultar la cola de cocina.
        </p>
      )}
      <Link to="/cocina" className="text-sm font-bold text-brand-orange">
        Abrir cocina
      </Link>
    </Card>
  )
}

function AccountantWidget() {
  const filters = useMemo(() => createCashClosingHistoryFilters(), [])
  const closings = useCashClosingHistory(filters)
  const latest = closings.data?.items?.[0]
  return (
    <Card className="grid gap-3" aria-labelledby="dashboard-accounting-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="dashboard-accounting-title" className="m-0 text-base font-bold">
            Control contable
          </h2>
          <p className="m-0 text-sm text-text-muted">Cierres y egresos disponibles.</p>
        </div>
        <BarChart3 aria-hidden="true" size={19} className="text-brand-orange" />
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Cierres del mes</dt>
          <dd className="m-0 font-bold">{closings.data?.totalCount ?? '—'}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-text-muted">Último cierre</dt>
          <dd className="m-0 font-bold">{latest?.businessDate ?? '—'}</dd>
        </div>
      </dl>
      {closings.error && (
        <p role="alert" className="m-0 text-sm text-warning">
          No se pudo consultar cierres.
        </p>
      )}
      <Link to="/turnos/cierres" className="text-sm font-bold text-brand-orange">
        Abrir cierres
      </Link>
    </Card>
  )
}

function RoleDashboard({ roles }: { roles: string[] }) {
  const links = roles.flatMap((role) => roleLinks[role] ?? [])
  const uniqueLinks = Array.from(new Map(links.map((link) => [link.href, link])).values())
  const operational = roles.some((role) => ['ADMINISTRADOR', 'ENCARGADO'].includes(role))
  const kitchen = roles.some((role) =>
    ['COCINA', 'ENCARGADO', 'ADMINISTRADOR', 'MESERO'].includes(role),
  )
  const accountant = roles.includes('CONTADORA')

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <AttendanceWidget />
        {operational && <OperationsWidget />}
        {kitchen && <KitchenWidget />}
        {accountant && <AccountantWidget />}
      </div>
      <section aria-labelledby="dashboard-shortcuts-title" className="grid gap-3">
        <div className="flex items-center gap-2">
          <Users aria-hidden="true" size={18} className="text-brand-orange" />
          <h2 id="dashboard-shortcuts-title" className="m-0 text-lg font-bold">
            Accesos operativos
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {uniqueLinks.map((link) => (
            <QuickLink key={link.href} {...link} />
          ))}
        </div>
      </section>
    </div>
  )
}

export function InicioPage() {
  const { user, logout, pending, error } = useAuth()
  const roles = user?.roles ?? []
  const canManageAttendance = ATTENDANCE_ADMIN_ROLES.some((role) => roles.includes(role))

  return (
    <div className="mx-auto grid min-w-0 max-w-6xl gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="m-0 text-sm font-bold uppercase tracking-wide text-brand-orange">
            Fratelli
          </p>
          <h1 className="m-0 text-2xl font-bold">Inicio</h1>
          <p className="m-0 text-sm text-text-muted">
            Tu centro operativo.
          </p>
        </div>
        <Button variant="secondary" loading={pending} onClick={() => void logout()}>
          Cerrar sesión
        </Button>
      </header>

      {error && (
        <p
          className="m-0 rounded-lg border border-danger bg-danger/10 p-3 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-lg font-bold text-text-muted">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? user?.username?.charAt(0)?.toUpperCase()}
          </span>
          <div className="min-w-0">
            <h2 className="m-0 truncate text-base font-bold">{user?.fullName ?? user?.username}</h2>
            <div className="flex flex-wrap gap-2 pt-1">
              {roles.map((role) => (
                <Badge key={role}>{role}</Badge>
              ))}
            </div>
          </div>
        </div>
        {canManageAttendance && (
          <Link to="/asistencia" className="text-sm font-bold text-brand-orange">
            Panel administrativo
          </Link>
        )}
      </Card>

      <RoleDashboard roles={roles} />
      <p className="flex items-center gap-2 text-xs text-text-muted">
        <CheckCircle2 aria-hidden="true" size={14} /> Los indicadores provienen de consultas
        operativas existentes; los estados no disponibles se muestran como —.
      </p>
    </div>
  )
}
