import { cloneElement, isValidElement, useId, useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Button, Input, Label } from '../atoms'

export function FormHint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="form-hint">
      {children}
    </p>
  )
}

export function FormError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="form-error" role="alert">
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
}

export function FormField({ label, children, hint, error, required = false }: FormFieldProps) {
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
    <div className="form-field">
      <Label htmlFor={controlId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </Label>
      {control}
      {hint && <FormHint id={hintId}>{hint}</FormHint>}
      {error && <FormError id={errorId}>{error}</FormError>}
    </div>
  )
}

export function SearchInput({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} className={`search-input ${className}`} type="search" />
}

export function PasswordInput({
  revealLabel = 'Mostrar contraseña',
  hideLabel = 'Ocultar contraseña',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { revealLabel?: string; hideLabel?: string }) {
  const id = useId()
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="password-input">
      <Input {...props} id={props.id ?? id} type={revealed ? 'text' : 'password'} />
      <Button type="button" variant="ghost" size="sm" onClick={() => setRevealed(!revealed)}>
        {revealed ? hideLabel : revealLabel}
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
    <div className="password-strength" aria-live="polite">
      <span>Fortaleza de la contraseña: {label}</span>
      <progress value={score} max="4" />
    </div>
  )
}
