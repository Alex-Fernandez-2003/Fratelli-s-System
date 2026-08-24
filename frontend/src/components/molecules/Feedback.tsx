import type { ReactNode } from 'react'

export function Alert({
  kind = 'info',
  title,
  children,
}: {
  kind?: 'info' | 'success' | 'error' | 'warning'
  title?: string
  children: ReactNode
}) {
  return (
    <div className={`alert alert--${kind}`} role="alert">
      {title && <strong>{title}</strong>}
      <span>{children}</span>
    </div>
  )
}

export function EmptyState({
  title = 'Aún no hay nada aquí',
  children,
  action,
}: {
  title?: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="empty-state">
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </section>
  )
}

export function StatCard({
  label,
  value,
  trend,
}: {
  label: string
  value: ReactNode
  trend?: ReactNode
}) {
  return (
    <section className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {trend && <small>{trend}</small>}
    </section>
  )
}
