import type { ReactNode } from 'react'
const alertBorders = {
  info: 'border-info',
  success: 'border-success',
  error: 'border-danger',
  warning: 'border-warning',
}
export function Alert({
  kind = 'info',
  title,
  children,
}: {
  kind?: keyof typeof alertBorders
  title?: string
  children: ReactNode
}) {
  return (
    <div className={`grid gap-1 border-l-4 p-3 ${alertBorders[kind]}`} role="alert">
      {title && <strong>{title}</strong>}
      <span>{children}</span>
    </div>
  )
}
export function EmptyState({
  title = 'A�n no hay nada aqu�',
  children,
  action,
}: {
  title?: string
  children?: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="p-4 text-center text-text-muted">
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
    <section className="grid gap-1 rounded-lg border border-border bg-surface p-4">
      <span>{label}</span>
      <strong className="text-2xl">{value}</strong>
      {trend && <small>{trend}</small>}
    </section>
  )
}
