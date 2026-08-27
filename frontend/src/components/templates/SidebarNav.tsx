import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthProvider'
import { Home, Clock } from 'lucide-react'

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()
  const location = useLocation()

  const links = [
    { to: '/inicio', icon: Home, label: 'Inicio' },
    { to: '/asistencia', icon: Clock, label: 'Asistencia' },
  ]

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-brand-orange text-[1.1rem] font-bold text-brand-black">
          F
        </span>
        <span className="text-lg font-bold text-text">Fratelli</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3" aria-label="Navegación principal">
        <ul className="m-0 list-none space-y-1 p-0">
          {links.map((link) => {
            const active = location.pathname === link.to
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
                    active
                      ? 'border-l-[3px] border-brand-orange bg-surface-elevated text-text'
                      : 'border-l-[3px] border-transparent text-text-muted hover:bg-surface-elevated hover:text-text'
                  }`}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold text-text-muted">
            {(user?.fullName ?? user?.username ?? 'U').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-sm font-bold text-text">
              {user?.fullName ?? user?.username}
            </p>
            <p className="m-0 truncate text-xs text-text-muted">{user?.username}@fratelli.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
