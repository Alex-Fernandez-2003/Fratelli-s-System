import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react'

export function Label({ className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`label ${className}`} />
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export function StatusDot({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger'
}) {
  return (
    <span className={`status-dot status-dot--${tone}`} role="status">
      {label}
    </span>
  )
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const safeValue = Math.min(100, Math.max(0, value))
  return <progress className="progress" value={safeValue} max="100" aria-label={label} />
}

export function Skeleton({
  className = '',
  label = 'Cargando contenido',
}: {
  className?: string
  label?: string
}) {
  return <span className={`skeleton ${className}`} aria-label={label} role="status" />
}

export function Divider() {
  return <hr className="divider" />
}

export function Avatar({ name, src }: { name: string; src?: string }) {
  return src ? (
    <img className="avatar" src={src} alt={name} />
  ) : (
    <span className="avatar" aria-label={name}>
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}

export function Surface({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section {...props} className={`surface ${className}`}>
      {children}
    </section>
  )
}

export function Card({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section {...props} className={`card ${className}`}>
      {children}
    </section>
  )
}
