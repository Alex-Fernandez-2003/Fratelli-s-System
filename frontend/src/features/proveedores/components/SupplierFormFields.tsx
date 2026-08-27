import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Input, Textarea } from '../../../components/atoms'
import { Alert, FormField } from '../../../components/molecules'
import type { Supplier, SupplierInput } from '../types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormErrors {
  name?: string
  phoneNumber?: string
  email?: string
}

interface SupplierFormFieldsProps {
  initial: Supplier | null
  submitting: boolean
  serverError?: string | null
  onSubmit: (input: SupplierInput) => void
  onCancel: () => void
}

export function SupplierFormFields({
  initial,
  submitting,
  serverError,
  onSubmit,
  onCancel,
}: SupplierFormFieldsProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [phoneNumber, setPhoneNumber] = useState(initial?.phoneNumber ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): boolean {
    const next: FormErrors = {}
    if (!name.trim()) next.name = 'El nombre es obligatorio.'
    if (!phoneNumber.trim()) next.phoneNumber = 'El teléfono es obligatorio.'
    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      next.email = 'El correo no tiene un formato válido.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    if (!validate()) return

    onSubmit({
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      email: email.trim() ? email.trim() : null,
      notes: notes.trim() ? notes.trim() : null,
    })
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      {serverError && <Alert kind="error">{serverError}</Alert>}

      {/*
        FormField (components/molecules/FormFields.tsx) genera el id del
        control y su aria-describedby automáticamente con useId() + cloneElement;
        no acepta `htmlFor` ni requiere que le pasemos aria-* a mano.
      */}
      <FormField label="Nombre del proveedor" required error={errors.name}>
        <Input value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} autoFocus />
      </FormField>

      <FormField label="Teléfono" required error={errors.phoneNumber}>
        <Input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={submitting} />
      </FormField>

      <FormField label="Correo electrónico (opcional)" error={errors.email}>
        <Input
          type="email"
          value={email ?? ''}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />
      </FormField>

      <FormField label="Notas / información de contacto (opcional)">
        <Textarea value={notes ?? ''} onChange={(e) => setNotes(e.target.value)} rows={3} disabled={submitting} />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting}>
          Guardar proveedor
        </Button>
      </div>
    </form>
  )
}
