import { useState, type ReactNode } from 'react'
import { useAuth } from '../../features/auth/AuthProvider'
import { Menu, X } from 'lucide-react'
import { SidebarNav } from './SidebarNav'
import { HeaderClock } from './HeaderClock'

export function AppLayout({
  children,
  bottomNavItems,
  showSidebar = true,
}: {
  children: ReactNode
  bottomNavItems?: { to: string; icon: ReactNode; label: string }[]
  showSidebar?: boolean
}) {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-background text-text">
      {/* Mobile header */}
      <header className="flex items-center justify-between bg-surface px-4 py-3 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-md border border-border bg-transparent p-2 text-text"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="text-lg font-bold text-brand-orange">Fratelli</span>
        <HeaderClock />
      </header>

      {/* Desktop header */}
      <header className="hidden items-center justify-between bg-surface px-6 py-3 lg:flex">
        <span className="text-sm font-bold text-text-muted">Panel del Colaborador</span>
        <div className="flex items-center gap-4">
          <HeaderClock />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{user?.fullName ?? user?.username}</span>
            <span className="inline-block rounded-full bg-surface-elevated px-2 py-0.5 text-[0.7rem] font-bold text-brand-orange uppercase">
              {user?.roles?.[0] ?? 'EMPLEADO'}
            </span>
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-surface-elevated text-[0.8rem] font-bold text-text-muted">
              {(user?.fullName ?? user?.username ?? 'U').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        {showSidebar && (
          <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
            <SidebarNav />
          </aside>
        )}

        {/* Mobile sidebar overlay */}
        {showSidebar && mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-overlay lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-60 flex-col border-r border-border bg-surface lg:hidden">
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </aside>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      {bottomNavItems && (
        <nav
          className="flex items-center justify-around border-t border-border bg-surface py-2 lg:hidden"
          aria-label="Navegación móvil"
        >
          {bottomNavItems.map((item) => (
            <a
              key={item.to}
              href={item.to}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-[0.7rem] text-text-muted no-underline transition-colors hover:text-brand-orange"
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
      )}
    </div>
  )
}
