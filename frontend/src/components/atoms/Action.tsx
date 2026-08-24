import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** @deprecated Use leftIcon. */
  startIcon?: ReactNode
  /** @deprecated Use rightIcon. */
  endIcon?: ReactNode
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
      className={`button button--${variant} button--${size} ${fullWidth ? 'button--full' : ''} ${className}`}
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
    <button {...props} className={`icon-button ${className}`} aria-label={label}>
      {children}
    </button>
  )
}

export function LinkButton({
  className = '',
  variant = 'primary',
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant }) {
  return <a {...props} className={`link-button link-button--${variant} ${className}`} />
}

export function Spinner({ label = 'Cargando' }: { label?: string }) {
  return <span className="spinner" role="status" aria-label={label} />
}
