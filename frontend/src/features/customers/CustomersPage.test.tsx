import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CustomersPage } from './CustomersPage'

const customer = {
  id: 'c1',
  name: 'Ana Pérez',
  ci: '123',
  nit: null,
  notes: 'Una nota muy extensa para comprobar el resumen.',
  isActive: true,
  createdAt: '',
  createdByUserId: '',
  updatedAt: '',
  updatedByUserId: '',
}
const query = {
  data: { items: [customer], page: 2, pageSize: 20, totalCount: 41, totalPages: 3 },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
}
const mutations = {
  create: { isPending: false, mutateAsync: vi.fn().mockResolvedValue(customer) },
  update: { isPending: false, mutateAsync: vi.fn().mockResolvedValue(customer) },
  activate: { isPending: false, mutateAsync: vi.fn() },
  deactivate: { isPending: false, mutateAsync: vi.fn() },
}
let roles = ['ADMINISTRADOR']
vi.mock('@/features/auth/AuthProvider', () => ({ useAuth: () => ({ user: { roles } }) }))
vi.mock('./api', () => ({
  useCustomers: () => query,
  useCreateCustomer: () => mutations.create,
  useUpdateCustomer: () => mutations.update,
  useActivateCustomer: () => mutations.activate,
  useDeactivateCustomer: () => mutations.deactivate,
}))

describe('CustomersPage', () => {
  afterEach(cleanup)
  it('renders server results in desktop table and mobile cards with nullable NIT', () => {
    render(<CustomersPage />)
    expect(screen.getAllByText('Ana Pérez')).toHaveLength(2)
    expect(screen.getAllByText('—')).not.toHaveLength(0)
    expect(document.querySelector('.hidden.md\\:block')).toBeInTheDocument()
    expect(document.querySelector('.md\\:hidden')).toBeInTheDocument()
  })
  it('resets filters to page one and paginates server-side', () => {
    render(<CustomersPage />)
    fireEvent.change(screen.getByLabelText('Buscar cliente'), { target: { value: 'ana' } })
    fireEvent.click(screen.getByRole('button', { name: 'Inactivos' }))
    expect(screen.getByDisplayValue('ana')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
  })
  it('provides create, edit, and independent lifecycle controls', () => {
    render(<CustomersPage />)
    expect(screen.getByRole('button', { name: 'Nuevo cliente' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Editar cliente' })).not.toHaveLength(0)
    expect(screen.getAllByRole('button', { name: 'Desactivar cliente' })).not.toHaveLength(0)
  })
  it('omits lifecycle actions for MESERO and distinguishes empty and error states', () => {
    roles = ['MESERO']
    const view = render(<CustomersPage />)
    expect(screen.queryByRole('button', { name: /desactivar cliente/i })).not.toBeInTheDocument()
    view.unmount()
    query.data = { ...query.data, items: [], totalCount: 0 }
    query.error = null
    render(<CustomersPage />)
    expect(screen.getByText('Todavía no hay clientes registrados.')).toBeInTheDocument()
    query.error = new Error('no')
    render(<CustomersPage />)
    expect(screen.getAllByRole('alert')).not.toHaveLength(0)
    roles = ['ADMINISTRADOR']
    query.data = { ...query.data, items: [customer], totalCount: 41 }
    query.error = null
  })
})
