import type { ReactNode } from 'react'
export function AppShell({
  header,
  navigation,
  sidebar,
  children,
  footer,
}: {
  header?: ReactNode
  navigation?: ReactNode
  sidebar?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="mx-auto max-w-6xl p-6">
      {header && <header className="py-3">{header}</header>}
      {navigation && (
        <nav className="py-3 text-text-muted" aria-label="Navegación principal">
          {navigation}
        </nav>
      )}
      <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
        {sidebar && <aside className="min-w-48">{sidebar}</aside>}
        <main className="grid gap-8">{children}</main>
      </div>
      {footer && <footer className="py-3">{footer}</footer>}
    </div>
  )
}
