import {
  ArrowLeftRight,
  ChefHat,
  ClipboardList,
  Home,
  Package,
  ReceiptText,
  ShoppingBag,
  UsersRound,
  Warehouse,
  Clock3,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Button } from '@/components/atoms'
import { HeaderClock } from '@/components/templates/HeaderClock'
import { useAuth } from '@/features/auth/AuthProvider'
import { SUPPLIER_READ_ROLES } from '@/features/proveedores/types'
import { PURCHASE_READ_ROLES } from '@/features/purchases/api'
import { SHIFT_MANAGE_ROLES, SHIFT_OWN_READ_ROLES } from '@/features/shifts/api'
import { useEffect, useRef, useState, type ComponentType } from 'react'

export const PRODUCT_READ_ROLES = ['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA'] as const
export const PRODUCT_MANAGE_ROLES = ['ADMINISTRADOR', 'ENCARGADO'] as const
export const ATTENDANCE_MANAGE_ROLES = ['ADMINISTRADOR', 'ENCARGADO'] as const

export type AuthNavigationItem = {
  id: string
  label: string
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
  readRoles?: readonly string[]
  target: string | ((roles: readonly string[]) => string)
  matches: (pathname: string) => boolean
}

const hasAnyRole = (roles: readonly string[], allowed: readonly string[]) =>
  allowed.some((role) => roles.includes(role))

const startsWithRoute = (route: string) => (pathname: string) =>
  pathname === route || pathname.startsWith(`${route}/`)

export const authenticatedNavigation: AuthNavigationItem[] = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: Home,
    target: '/inicio',
    matches: startsWithRoute('/inicio'),
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    icon: ClipboardList,
    readRoles: ['MESERO', 'ENCARGADO', 'ADMINISTRADOR'],
    target: '/pedidos',
    matches: startsWithRoute('/pedidos'),
  },
  {
    id: 'cocina',
    label: 'Cocina',
    icon: ChefHat,
    readRoles: ['COCINA', 'MESERO', 'ENCARGADO', 'ADMINISTRADOR'],
    target: '/cocina',
    matches: startsWithRoute('/cocina'),
  },
  {
    id: 'productos',
    label: 'Productos',
    icon: Package,
    readRoles: PRODUCT_READ_ROLES,
    target: '/productos',
    matches: startsWithRoute('/productos'),
  },
  {
    id: 'produccion',
    label: 'Produccion',
    icon: ChefHat,
    readRoles: ['COCINA', 'ENCARGADO', 'ADMINISTRADOR'],
    target: '/produccion/registrar',
    matches: startsWithRoute('/produccion'),
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: Warehouse,
    readRoles: ['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA'],
    target: '/inventario',
    matches: startsWithRoute('/inventario'),
  },
  {
    id: 'asistencia',
    label: 'Asistencia',
    icon: Clock3,
    target: (roles) =>
      hasAnyRole(roles, ATTENDANCE_MANAGE_ROLES) ? '/asistencia' : '/mi-asistencia',
    matches: (pathname) => pathname === '/asistencia' || pathname === '/mi-asistencia',
  },
  {
    id: 'turnos',
    label: 'Turnos / Caja',
    icon: ArrowLeftRight,
    readRoles: SHIFT_OWN_READ_ROLES,
    target: (roles) => (hasAnyRole(roles, SHIFT_MANAGE_ROLES) ? '/turnos' : '/mi-turno'),
    matches: (pathname) => pathname === '/turnos' || pathname === '/mi-turno',
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: Package,
    readRoles: SUPPLIER_READ_ROLES,
    target: '/proveedores',
    matches: startsWithRoute('/proveedores'),
  },
  {
    id: 'compras',
    label: 'Compras',
    icon: ShoppingBag,

    readRoles: PURCHASE_READ_ROLES,
    target: '/compras',
    matches: startsWithRoute('/compras'),
  },
  {
    id: 'gastos',
    label: 'Gastos',
    icon: ReceiptText,
    readRoles: ['ADMINISTRADOR', 'ENCARGADO'],
    target: '/gastos',
    matches: startsWithRoute('/gastos'),
  },
  {
    id: 'usuarios',
    label: 'Usuarios y roles',
    icon: UsersRound,
    readRoles: ['ADMINISTRADOR'],
    target: '/usuarios',
    matches: startsWithRoute('/usuarios'),
  },
]

export function visibleNavigation(roles: readonly string[]) {
  return authenticatedNavigation.filter(
    (item) => !item.readRoles || hasAnyRole(roles, item.readRoles),
  )
}

export function canManageProducts(roles: readonly string[]) {
  return hasAnyRole(roles, PRODUCT_MANAGE_ROLES)
}

function Profile({ compact = false }: { compact?: boolean }) {
  const { user } = useAuth()
  const name = user?.fullName ?? user?.username ?? 'Usuario'
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold text-text-muted">
        {name.charAt(0).toUpperCase()}
      </span>
      {!compact && <span className="truncate text-sm font-bold text-text">{name}</span>}
    </div>
  )
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const roles = user?.roles ?? []
  return (
    <nav className="flex-1 px-3" aria-label="Navegación principal">
      <ul className="m-0 list-none space-y-1 p-0">
        {visibleNavigation(roles).map((item) => {
          const Icon = item.icon
          const target = typeof item.target === 'function' ? item.target(roles) : item.target
          const active = item.matches(pathname)
          return (
            <li key={item.id}>
              <NavLink
                to={target}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
                  active
                    ? 'bg-surface-elevated text-brand-orange'
                    : 'text-text-muted hover:bg-surface-elevated hover:text-text'
                }`}
              >
                <Icon aria-hidden={true} size={18} />
                {item.label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-orange text-[1.1rem] font-bold text-brand-black">
        F
      </span>
      <span className="text-lg font-bold text-text">Fratelli</span>
    </div>
  )
}

export function AuthenticatedLayout() {
  const { user, logout, pending } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!mobileOpen) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    drawerRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      ;(previouslyFocused ?? triggerRef.current)?.focus()
    }
  }, [mobileOpen])

  const closeDrawer = () => setMobileOpen(false)
  const name = user?.fullName ?? user?.username ?? 'Usuario'

  return (
    <div className="min-h-screen bg-background text-text lg:flex">
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-border bg-brand-black lg:flex">
        <Brand />
        <NavigationLinks />
        <div className="border-t border-border px-4 py-4">
          <Profile />
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border bg-surface px-4 lg:hidden">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-text hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-brand-orange"
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <Menu aria-hidden="true" size={22} />
        </button>
        <div className="flex items-center gap-2">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-brand-orange font-bold text-brand-black">
            F
          </span>
          <strong>Fratelli</strong>
        </div>
        <div className="flex items-center gap-3">
          <HeaderClock />
          <Profile compact />
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-overlay"
            aria-label="Cerrar menú"
            onClick={closeDrawer}
          />
          <aside
            id="mobile-navigation"
            ref={drawerRef}
            tabIndex={-1}
            className="relative flex h-full w-[min(20rem,86vw)] flex-col border-r border-border bg-brand-black shadow-2xl"
            aria-label="Menú de navegación"
          >
            <div className="flex items-center justify-between border-b border-border">
              <Brand />
              <button
                type="button"
                onClick={closeDrawer}
                className="mr-4 rounded-lg p-2 text-text-muted hover:bg-surface-elevated focus-visible:outline-2 focus-visible:outline-brand-orange"
                aria-label="Cerrar menú"
              >
                <X aria-hidden="true" size={22} />
              </button>
            </div>
            <NavigationLinks onNavigate={closeDrawer} />
            <div className="border-t border-border px-4 py-4">
              <Profile />
            </div>
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="hidden min-h-16 items-center justify-between border-b border-border bg-surface px-8 lg:flex">
          <span className="text-sm font-semibold text-text-muted">{name}</span>
          <div className="flex items-center gap-4">
            <HeaderClock />
            <Profile />
            <Button
              type="button"
              onClick={() => void logout()}
              loading={pending}
              variant="outline"
              size="sm"
              leftIcon={<LogOut size={16} />}
            >
              Cerrar sesión
            </Button>
          </div>
        </header>
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
