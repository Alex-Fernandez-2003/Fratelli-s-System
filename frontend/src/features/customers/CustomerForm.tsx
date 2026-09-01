import { useState, type FormEvent } from 'react'
import { Button, Input, Textarea } from '@/components/atoms'
import { Alert, FormField } from '@/components/molecules'
import { HttpError } from '@/lib/api/http-client'
import type { Customer, CustomerRequest } from './api'

type Props = {
  initial?: Pick<Customer, 'name' | 'ci' | 'nit' | 'notes'>
  pending: boolean
  serverError?: unknown
  onSubmit: (request: CustomerRequest) => void
  onCancel: () => void
}
type Errors = { name?: string; ci?: string }

export function customerError(error: unknown): { ci?: string; nit?: string; general?: string } {
  if (!(error instanceof HttpError) || error.problem.code !== 'DUPLICATE_CUSTOMER_IDENTIFIER') {
    return error ? { general: 'No se pudo guardar el cliente. Inténtalo nuevamente.' } : {}
  }
  const detail = `${error.problem.title ?? ''} ${error.problem.detail ?? ''}`
  if (/\bCI\b/i.test(detail)) return { ci: 'Ya existe un cliente con este CI.' }
  if (/\bNIT\b/i.test(detail)) return { nit: 'Ya existe un cliente con este NIT.' }
  return { general: 'Ya existe un cliente con estos datos.' }
}

export function CustomerForm({ initial, pending, serverError, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [ci, setCi] = useState(initial?.ci ?? '')
  const [nit, setNit] = useState(initial?.nit ?? '')
  const [notes, setNotes] = useState(initial?.notes ?? '')
  const [errors, setErrors] = useState<Errors>({})
  const conflict = customerError(serverError)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const next = {
      name: name.trim() ? undefined : 'El nombre es obligatorio.',
      ci: ci.trim() ? undefined : 'El CI es obligatorio.',
    }
    setErrors(next)
    if (next.name || next.ci) return
    onSubmit({
      name: name.trim(),
      ci: ci.trim(),
      nit: nit.trim() || null,
      notes: notes.trim() || null,
    })
  }

  return (
    <form className="grid gap-4" onSubmit={submit} noValidate>
      {conflict.general && <Alert kind="error">{conflict.general}</Alert>}
      <FormField label="Nombre" required error={errors.name}>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={pending}
          autoFocus
        />
      </FormField>
      <FormField label="CI" required error={errors.ci ?? conflict.ci}>
        <Input value={ci} onChange={(event) => setCi(event.target.value)} disabled={pending} />
      </FormField>
      <FormField label="NIT (opcional)" error={conflict.nit}>
        <Input value={nit} onChange={(event) => setNit(event.target.value)} disabled={pending} />
      </FormField>
      <FormField label="Notas (opcional)">
        <Textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={pending}
          rows={3}
        />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={pending}>
          Cancelar
        </Button>
        <Button type="submit" loading={pending}>
          Guardar cliente
        </Button>
      </div>
    </form>
  )
}
