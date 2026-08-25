import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginPage } from './LoginPage'

const { login } = vi.hoisted(() => ({ login: vi.fn() }))
let auth = { login, pending: false, error: null as string | null }
vi.mock('../features/auth/AuthProvider', () => ({ useAuth: () => auth }))

afterEach(() => {
  login.mockReset()
  auth = { login, pending: false, error: null }
})

describe('LoginPage', () => {
  it('validates required credentials and connects each error to its control', () => {
    render(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(screen.getByLabelText('Identificador de acceso *')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByLabelText('Contraseña *')).toHaveAttribute('aria-describedby')
    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(login).not.toHaveBeenCalled()
  })

  it('prevents a duplicate submit while the provider is pending and shows a controlled rejection', () => {
    auth = { login, pending: true, error: 'Usuario o contraseña incorrectos.' }
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /CargandoIngresando/ })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.')
    fireEvent.submit(screen.getByRole('button', { name: /CargandoIngresando/ }).closest('form')!)
    expect(login).not.toHaveBeenCalled()
  })

  it('renders the current branded composition and required AuthLayout title', () => {
    render(<LoginPage />)
    expect(screen.getByText('Restaurant System')).toBeInTheDocument()
    expect(screen.getByText('Fratelli')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { name: 'Iniciar sesión' })).toHaveLength(2)
    expect(screen.getByText('Accede con tus credenciales para continuar')).toBeInTheDocument()
  })

  it('keeps the visual loading treatment accessible while credentials are pending', () => {
    auth = { login, pending: true, error: null }
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /CargandoIngresando/ })).toBeDisabled()
    expect(screen.getByLabelText('Iniciando sesión')).toBeInTheDocument()
  })

  it('uses one integrated composition instead of a nested AuthLayout panel', () => {
    render(<LoginPage />)
    expect(screen.getByRole('main')).toHaveAttribute('data-layout', 'integrated')
  })
})
