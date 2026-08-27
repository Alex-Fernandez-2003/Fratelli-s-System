import { ChefHat, ClipboardList, Home, Package, UsersRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { AppShell } from '@/components/templates'
import { Button } from '@/components/atoms'
import { useAuth } from '@/features/auth/AuthProvider'
import type { ReactNode } from 'react'

export type AuthNavigationItem = {
  path: '/inicio' | '/usuarios' | '/pedidos' | '/cocina' | '/productos'
  label: string
  icon: ReactNode
  allowedRoles?: string[]
}

export const authenticatedNavigation: AuthNavigationItem[] = [
  { path: '/inicio', label: 'Inicio', icon: <Home aria-hidden="true" size={18} /> },
  {
    path: '/pedidos',
    label: 'Pedidos',
    icon: <ClipboardList aria-hidden="true" size={18} />,
    allowedRoles: ['MESERO', 'ENCARGADO', 'ADMINISTRADOR'],
  },
  {
    path: '/cocina',
    label: 'Cocina',
    icon: <ChefHat aria-hidden="true" size={18} />,
    allowedRoles: ['COCINA', 'MESERO', 'ENCARGADO', 'ADMINISTRADOR'],
  },
  {
    path: '/productos',
    label: 'Productos',
    icon: <Package aria-hidden="true" size={18} />,
    allowedRoles: ['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA'],
  },
  {
    path: '/usuarios',
    label: 'Usuarios y roles',
    icon: <UsersRound aria-hidden="true" size={18} />,
    allowedRoles: ['ADMINISTRADOR'],
  },
]

export function AuthenticatedLayout() {
  const { user, hasAnyRole, logout, pending } = useAuth()
  const items = authenticatedNavigation.filter(
    (item) => !item.allowedRoles || hasAnyRole(item.allowedRoles),
  )

  return (
    <AppShell
      header={
        <div className="flex items-start justify-between gap-4 [&_p]:text-text-muted">
          <div>
            <strong>Fratelli</strong>
            <p className="text-sm">{user?.fullName ?? user?.username}</p>
          </div>
          <Button
            type="button"
            onClick={() => void logout()}
            loading={pending}
            variant="outline"
            size="sm"
          >
            Cerrar sesión
          </Button>
        </div>
      }
      sidebar={
        <nav aria-label="Navegación principal" className="flex gap-2 md:grid">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center gap-2 rounded-md px-3 py-2 font-bold ${isActive
                  ? 'bg-brand-orange text-brand-black'
                  : 'text-text hover:bg-surface-elevated'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      }
    >
      <Outlet />
    </AppShell>
  )
}