import { Eye, EyeOff } from 'lucide-react'
import { cloneElement, isValidElement, useId, useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Button, Input, Label } from '../atoms'
export function FormHint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="m-0 text-sm text-text-muted">
      {children}
    </p>
  )
}
export function FormError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="m-0 text-sm text-danger" role="alert">
      {children}
    </p>
  )
}
type FormFieldProps = {
  label: string
  children: ReactNode
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  leadingIcon?: ReactNode
}
export function FormField({
  label,
  children,
  hint,
  error,
  required = false,
  leadingIcon,
}: FormFieldProps) {
  const generatedId = useId()

  const hintId = hint ? `${generatedId}-hint` : undefined
  const errorId = error ? `${generatedId}-error` : undefined

  const controlId = isValidElement<Record<string, unknown>>(children)
    ? ((children.props.id as string | undefined) ?? generatedId)
    : generatedId

  const control = isValidElement<Record<string, unknown>>(children)
    ? cloneElement(children, {
        id: controlId,
        'aria-describedby':
          [children.props['aria-describedby'] as string | undefined, hintId, errorId]
            .filter(Boolean)
            .flatMap((value) => value!.split(/\s+/))
            .filter((value, index, values) => values.indexOf(value) === index)
            .join(' ') || undefined,
        'aria-invalid': error ? true : children.props['aria-invalid'],
      })
    : children

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={controlId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </Label>

      {leadingIcon ? (
        <div className="relative [&>input]:pl-11 [&_.password-input>input]:pl-11">
          <span
            className="pointer-events-none absolute top-1/2 left-3 z-10 grid -translate-y-1/2 place-items-center text-text-muted"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>

          {control}
        </div>
      ) : (
        control
      )}

      {hint && <FormHint id={hintId}>{hint}</FormHint>}
      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  )
}
export function SearchInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} className={className} type="search" />
}
export function PasswordInput({
  revealLabel = 'Mostrar contraseña',
  hideLabel = 'Ocultar contraseña',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { revealLabel?: string; hideLabel?: string }) {
  const id = useId()
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="password-input relative flex items-center">
      <Input
        {...props}
        id={props.id ?? id}
        className="pr-11"
        type={revealed ? 'text' : 'password'}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 min-h-11 min-w-11 text-text-muted"
        aria-label={revealed ? hideLabel : revealLabel}
        onClick={() => setRevealed(!revealed)}
      >
        {revealed ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
      </Button>
    </div>
  )
}
export function PasswordStrength({ value }: { value: string }) {
  const score = [
    value.length >= 8,
    /[A-Z]/.test(value),
    /[0-9]/.test(value),
    /[^A-Za-z0-9]/.test(value),
  ].filter(Boolean).length
  const label = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'][score]
  return (
    <div className="grid gap-1 text-sm text-text-muted" aria-live="polite">
      <span>Fortaleza de la contraseña: {label}</span>
      <progress className="accent-brand-orange" value={score} max="4" />
    </div>
  )
}
