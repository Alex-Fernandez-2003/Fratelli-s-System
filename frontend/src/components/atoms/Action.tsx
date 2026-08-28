import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-brand-orange text-brand-black hover:bg-brand-orange-hover',
  secondary: 'border-border bg-surface-elevated text-text',
  outline:
    'border-brand-orange bg-transparent text-brand-orange hover:bg-brand-orange hover:text-brand-black',
  ghost: 'border-transparent bg-transparent text-text',
  danger: 'border-transparent bg-danger text-text',
}
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-sm',
  md: 'px-3.5 py-2.5',
  lg: 'px-4.5 py-3 text-lg',
}
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** @deprecated Use leftIcon. */ startIcon?: ReactNode
  /** @deprecated Use rightIcon. */ endIcon?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  startIcon,
  endIcon,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md border font-bold no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <Spinner />
      ) : (
        (leftIcon ?? startIcon) && <span aria-hidden="true">{leftIcon ?? startIcon}</span>
      )}
      <span>{children}</span>
      {!loading && (rightIcon ?? endIcon) && <span aria-hidden="true">{rightIcon ?? endIcon}</span>}
    </button>
  )
}
export function IconButton({
  children,
  label,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border bg-transparent p-2 text-text transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      aria-label={label}
    >
      {children}
    </button>
  )
}
export function LinkButton({
  className = '',
  variant = 'primary',
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant }) {
  return (
    <a
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-3.5 py-2.5 font-bold no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${variantClasses[variant]} ${className}`}
    />
  )
}
export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return (
    <span
      className="inline-block size-4 animate-spin rounded-full border-[0.2rem] border-border border-r-brand-orange"
      role="status"
      aria-label={label}
    />
  )
}
