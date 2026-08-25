import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from 'react'
export function Label({ className = '', ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label {...props} className={`mb-1.5 block font-bold ${className}`} />
}
const toneClasses = {
  neutral: 'text-text',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
}
export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: keyof typeof toneClasses
}) {
  return (
    <span
      className={`inline-block rounded-full bg-surface-elevated px-2 py-0.5 text-[0.8rem] ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
export function StatusDot({
  label,
  tone = 'neutral',
}: {
  label: string
  tone?: keyof typeof toneClasses
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${toneClasses[tone]}`} role="status">
      <span className="size-2 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  )
}
export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <progress
      className="w-full accent-brand-orange"
      value={Math.min(100, Math.max(0, value))}
      max="100"
      aria-label={label}
    />
  )
}
export function Skeleton({
  className = '',
  label = 'Cargando contenido',
}: {
  className?: string
  label?: string
}) {
  return (
    <span
      className={`block h-4 w-full animate-pulse rounded bg-surface-elevated ${className}`}
      aria-label={label}
      role="status"
    />
  )
}
export function Divider() {
  return <hr className="border-0 border-t border-border" />
}
export function Avatar({ name, src }: { name: string; src?: string }) {
  const classes =
    'inline-flex size-10 items-center justify-center rounded-full bg-surface-elevated object-cover'
  return src ? (
    <img className={classes} src={src} alt={name} />
  ) : (
    <span className={classes} aria-label={name}>
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
    <section {...props} className={`rounded-lg border border-border bg-surface p-4 ${className}`}>
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
    <section
      {...props}
      className={`rounded-lg border border-border bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(0_0_0_/_15%)] ${className}`}
    >
      {children}
    </section>
  )
}
