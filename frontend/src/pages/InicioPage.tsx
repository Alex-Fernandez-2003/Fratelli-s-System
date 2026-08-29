import { Button } from '../components/atoms'
<<<<<<< Updated upstream

import { Link } from 'react-router-dom'
import { Clock, Users, LogOut } from 'lucide-react'
=======
import { PrimaryNav } from '../components/molecules'
import { AppShell } from '../components/templates'
>>>>>>> Stashed changes
import { useAuth } from '../features/auth/AuthProvider'
import { SUPPLIER_READ_ROLES } from '../features/proveedores/types'

const ATTENDANCE_MANAGE_ROLES = ['ADMINISTRADOR', 'ENCARGADO']

export function InicioPage() {
  const { user, logout, pending, error, hasAnyRole } = useAuth()

<<<<<<< Updated upstream
  const canManageAttendance = hasAnyRole(ATTENDANCE_MANAGE_ROLES)
=======
  const navItems = [
    { label: 'Inicio', href: '/inicio' },
    ...(hasAnyRole([...SUPPLIER_READ_ROLES]) ? [{ label: 'Proveedores', href: '/proveedores' }] : []),
  ]
>>>>>>> Stashed changes

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Inicio</h1>

      {error && (
        <p
          className="rounded-lg border border-danger bg-danger/10 p-3 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold text-text-muted">
            {user?.fullName?.charAt(0)?.toUpperCase() ?? user?.username?.charAt(0)?.toUpperCase()}
          </span>
          <div>
            <h2 className="font-bold">{user?.fullName ?? user?.username}</h2>
            <p className="text-xs text-text-muted">{user?.roles.join(', ')}</p>
          </div>
        </div>
<<<<<<< Updated upstream
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<LogOut size={16} />}
          loading={pending}
          onClick={() => void logout()}
        >
          Cerrar sesión
        </Button>
      </div>

      <nav className="space-y-2">
        <Link
          to="/mi-asistencia"
          className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-elevated"
        >
          <Clock size={20} className="text-brand-orange" />
          <div>
            <h3 className="text-sm font-bold">Mi asistencia</h3>
            <p className="text-xs text-text-muted">Consulta tu historial registrado.</p>
          </div>
        </Link>
        {canManageAttendance && (
          <Link
            to="/asistencia"
            className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:bg-surface-elevated"
          >
            <Users size={20} className="text-brand-orange" />
            <div>
              <h3 className="text-sm font-bold">Panel del colaborador</h3>
              <p className="text-xs text-text-muted">Gestionar asistencia del personal.</p>
            </div>
          </Link>
        )}
      </nav>
    </div>
=======
      }
      navigation={<PrimaryNav items={navItems} />}
    >
      {error && <p role="alert">{error}</p>}
      <section className="rounded-lg border border-border bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(0_0_0_/_15%)]">
        <h2>Bienvenido, {user?.fullName ?? user?.username}</h2>
        <p>Roles: {user?.roles.join(', ')}</p>
      </section>
    </AppShell>
>>>>>>> Stashed changes
  )
}