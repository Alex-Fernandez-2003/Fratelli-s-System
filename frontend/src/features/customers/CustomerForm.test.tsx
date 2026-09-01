import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HttpError } from '@/lib/api/http-client'
import { CustomerForm } from './CustomerForm'

function renderForm(props: Partial<React.ComponentProps<typeof CustomerForm>> = {}) {
  const onSubmit = vi.fn()
  render(<CustomerForm onSubmit={onSubmit} onCancel={vi.fn()} pending={false} {...props} />)
  return onSubmit
}

describe('CustomerForm', () => {
  it('requires Nombre and CI, trims input, maps empty optional values to null, and has no status control', () => {
    const onSubmit = renderForm()
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cliente' }))
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: ' Ana ' } })
    fireEvent.change(screen.getByLabelText(/^CI/), { target: { value: ' 123 ' } })
    fireEvent.change(screen.getByLabelText(/NIT/), { target: { value: '  ' } })
    fireEvent.change(screen.getByLabelText(/Notas/), { target: { value: '  ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cliente' }))
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ana', ci: '123', nit: null, notes: null })
    expect(screen.queryByLabelText(/activo|isactive/i)).not.toBeInTheDocument()
  })

  it('maps attributable duplicate identifiers, keeps a general duplicate safe, and blocks pending submits', () => {
    const onSubmit = renderForm({
      serverError: new HttpError(409, {
        code: 'DUPLICATE_CUSTOMER_IDENTIFIER',
        detail: 'CI duplicado',
      }),
    })
    expect(screen.getByText('Ya existe un cliente con este CI.')).toBeInTheDocument()
    renderForm({
      serverError: new HttpError(409, { code: 'DUPLICATE_CUSTOMER_IDENTIFIER' }),
      pending: true,
    })
    expect(screen.getAllByText('Ya existe un cliente con estos datos.')).toHaveLength(1)
    const pendingSubmit = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('type') === 'submit')[1]
    expect(pendingSubmit).toBeDisabled()
    fireEvent.click(pendingSubmit)
    expect(onSubmit).not.toHaveBeenCalled()
    renderForm({
      serverError: new HttpError(409, {
        code: 'DUPLICATE_CUSTOMER_IDENTIFIER',
        detail: 'NIT duplicado',
      }),
    })
    expect(screen.getByText('Ya existe un cliente con este NIT.')).toBeInTheDocument()
  })
})
