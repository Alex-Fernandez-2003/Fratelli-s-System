import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes, RequireAnyRole } from './AppRoutes'

let auth = {
  status: 'checking' as 'checking' | 'authenticated' | 'unauthenticated',
  hasAnyRole: vi.fn(() => false),
}
vi.mock('../features/auth/AuthProvider', () => ({ useAuth: () => auth }))
vi.mock('../pages/LoginPage', () => ({ LoginPage: () => <p>Login page</p> }))
vi.mock('../pages/InicioPage', () => ({ InicioPage: () => <p>Inicio page</p> }))
vi.mock('../pages/ForbiddenPage', () => ({ ForbiddenPage: () => <p>Forbidden page</p> }))
vi.mock('../pages/UiKitPage', () => ({ UiKitPage: () => <p>UI kit page</p> }))

function Location() {
  return <p data-testid="location">{useLocation().pathname}</p>
}
function renderRoutes(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <Location />
    </MemoryRouter>,
  )
}

afterEach(() => {
  auth = { status: 'checking', hasAnyRole: vi.fn(() => false) }
})

describe('AppRoutes', () => {
  it('holds a protected route at bootstrap without flashing Login', () => {
    renderRoutes('/inicio')
    expect(screen.getAllByRole('status', { name: 'Comprobando sesión' })).not.toHaveLength(0)
    expect(screen.queryByText('Login page')).not.toBeInTheDocument()
  })

  it('redirects an unauthenticated protected visit to Login', () => {
    auth.status = 'unauthenticated'
    renderRoutes('/inicio')
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/login')
  })

  it('redirects an authenticated Login visit to Inicio and renders Inicio when protected', () => {
    auth.status = 'authenticated'
    renderRoutes('/login')
    expect(screen.getByText('Inicio page')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/inicio')
  })

  it.each(['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA'])(
    'allows the %s inventory read role through the shared guard',
    () => {
      auth.status = 'authenticated'
      auth.hasAnyRole.mockReturnValue(true)
      render(
        <MemoryRouter initialEntries={['/inventario']}>
          <Routes>
            <Route
              element={
                <RequireAnyRole
                  roles={['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA']}
                />
              }
            >
              <Route path="/inventario" element={<p>Inventory page</p>} />
            </Route>
            <Route path="/403" element={<p>Forbidden page</p>} />
          </Routes>
        </MemoryRouter>,
      )
      expect(screen.getByText('Inventory page')).toBeInTheDocument()
    },
  )

  it('sends an EMPLEADO-only authenticated user to the generic Forbidden route', () => {
    auth.status = 'authenticated'
    auth.hasAnyRole.mockReturnValue(false)
    render(
      <MemoryRouter initialEntries={['/inventario']}>
        <Routes>
          <Route
            element={
              <RequireAnyRole
                roles={['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA']}
              />
            }
          >
            <Route path="/inventario" element={<p>Inventory page</p>} />
          </Route>
          <Route path="/403" element={<p>Forbidden page</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Forbidden page')).toBeInTheDocument()
    expect(screen.queryByText('Inventory page')).not.toBeInTheDocument()
  })
})
