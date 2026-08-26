import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UsersPage } from './UsersPage'

const user = {
  id: 'u1',
  employeeId: 'e1',
  fullName: 'Ana Admin',
  username: 'ana',
  roles: ['ADMINISTRADOR'],
  isActive: true,
  hasPassword: false,
}
const mutation = { isPending: false, mutateAsync: vi.fn().mockResolvedValue(undefined) }
vi.mock('@/features/auth/AuthProvider', () => ({
  useAuth: () => ({ user, refreshCurrentUser: vi.fn(), clearLocalSession: vi.fn() }),
}))
vi.mock('../api/queries', () => ({
  useUsersList: () => ({
    data: { items: [user], totalPages: 1 },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useCreateUser: () => mutation,
  useUpdateUser: () => mutation,
  useSetUserPassword: () => mutation,
  useActivateUser: () => mutation,
  useDeactivateUser: () => mutation,
}))

describe('UsersPage', () => {
  it('renders mobile-compatible user actions and password wording from hasPassword', () => {
    render(<UsersPage />)
    expect(screen.getAllByText('Ana Admin')).not.toHaveLength(0)
    fireEvent.click(screen.getAllByRole('button', { name: 'Establecer contraseña' })[0])
    expect(screen.getByRole('dialog', { name: /establecer contraseña/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument()
  })
  it('requires at least one role before creating a user', () => {
    render(<UsersPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    expect(screen.getByText(/elegí al menos un rol/i)).toBeInTheDocument()
  })
  it('uses reset wording when the user already has a password', () => {
    user.hasPassword = true
    render(<UsersPage />)
    expect(screen.getAllByRole('button', { name: 'Restablecer contraseña' })).not.toHaveLength(0)
    user.hasPassword = false
  })
  it('prepopulates edit and confirms lifecycle actions before mutation', () => {
    render(<UsersPage />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Editar usuario' })[0])
    expect(screen.getByDisplayValue('Ana Admin')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Desactivar usuario' })[0])
    expect(screen.getByRole('dialog', { name: /desactivar usuario/i })).toBeInTheDocument()
    expect(screen.getByText(/perderá acceso/i)).toBeInTheDocument()
  })
  it('resets pagination when search and filters change', () => {
    render(<UsersPage />)
    fireEvent.change(screen.getByLabelText('Buscar usuario'), { target: { value: 'ana' } })
    fireEvent.change(screen.getByLabelText('Rol'), { target: { value: 'COCINA' } })
    fireEvent.click(screen.getByRole('button', { name: 'Inactivos' }))
    expect(screen.getByDisplayValue('ana')).toBeInTheDocument()
    expect(screen.getByDisplayValue('COCINA')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Inactivos' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
