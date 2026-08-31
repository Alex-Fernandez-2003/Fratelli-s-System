import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PRODUCT_READ_ROLES } from '../features/navigation'
import { PURCHASE_READ_ROLES, PURCHASE_WRITE_ROLES } from '../features/purchases/api'
import { SHIFT_MANAGE_ROLES, SHIFT_OWN_READ_ROLES } from '../features/shifts/api'
import { AppRoutes, RequireAnyRole } from './AppRoutes'

let auth = {
  status: 'checking' as 'checking' | 'authenticated' | 'unauthenticated',
  hasAnyRole: vi.fn<(roles: string[]) => boolean>(() => false),
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
  auth = { status: 'checking', hasAnyRole: vi.fn<(roles: string[]) => boolean>(() => false) }
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

  it.each([
    ['/productos/preparation-1/composicion', ['MESERO'], [...PRODUCT_READ_ROLES], true],
    ['/productos/preparation-1/composicion', ['EMPLEADO'], [...PRODUCT_READ_ROLES], false],
    [
      '/inventario',
      ['MESERO'],
      ['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA'],
      true,
    ],
    [
      '/inventario?tab=notificaciones',
      ['CONTADORA'],
      ['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA'],
      true,
    ],
    [
      '/inventario/movimientos',
      ['CONTADORA'],
      ['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA'],
      true,
    ],
    [
      '/inventario/movimientos',
      ['EMPLEADO'],
      ['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA'],
      false,
    ],
    [
      '/inventario',
      ['EMPLEADO'],
      ['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA'],
      false,
    ],
    ['/compras', ['CONTADORA'], [...PURCHASE_READ_ROLES], true],
    ['/compras/nueva', ['CONTADORA'], [...PURCHASE_WRITE_ROLES], false],
    ['/mi-turno', ['MESERO'], [...SHIFT_OWN_READ_ROLES], true],
    ['/mi-turno', ['COCINA'], [...SHIFT_OWN_READ_ROLES], false],
    ['/turnos', ['MESERO'], [...SHIFT_MANAGE_ROLES], false],
    ['/turnos', ['MESERO', 'ENCARGADO'], [...SHIFT_MANAGE_ROLES], true],
  ])(
    'applies the direct-route guard for %s and role union %s',
    (path, userRoles, allowedRoles, allowed) => {
      auth.status = 'authenticated'
      auth.hasAnyRole = vi.fn((roles: string[]) => roles.some((role) => userRoles.includes(role)))
      const pageName = `Page ${path}`

      render(
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route element={<RequireAnyRole roles={allowedRoles} />}>
              <Route path={path.split('?')[0]} element={<p>{pageName}</p>} />
            </Route>
            <Route path="/403" element={<p>Forbidden page</p>} />
          </Routes>
        </MemoryRouter>,
      )

      if (allowed) {
        expect(screen.getByText(pageName)).toBeInTheDocument()
        expect(screen.queryByText('Forbidden page')).not.toBeInTheDocument()
      } else {
        expect(screen.getByText('Forbidden page')).toBeInTheDocument()
        expect(screen.queryByText(pageName)).not.toBeInTheDocument()
      }
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
