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
    <div className="app-shell">
      {header && <header className="app-shell__header">{header}</header>}
      {navigation && (
        <nav className="app-shell__nav" aria-label="Navegación principal">
          {navigation}
        </nav>
      )}
      <div className="app-shell__body">
        {sidebar && <aside className="app-shell__sidebar">{sidebar}</aside>}
        <main className="app-shell__main">{children}</main>
      </div>
      {footer && <footer className="app-shell__footer">{footer}</footer>}
    </div>
  )
}
