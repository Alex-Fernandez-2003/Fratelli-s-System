import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CUSTOMER_READ_ROLES,
  PRODUCT_READ_ROLES,
  SALES_HISTORY_READ_ROLES,
  REPORT_ATTENDANCE_READ_ROLES,
  REPORT_INVENTORY_READ_ROLES,
  REPORT_SALES_READ_ROLES,
} from '../features/navigation'
import { PURCHASE_READ_ROLES, PURCHASE_WRITE_ROLES } from '../features/purchases/api'
import { SHIFT_MANAGE_ROLES, SHIFT_OWN_READ_ROLES } from '../features/shifts/api'
import { CASH_HISTORY_READ_ROLES } from '../features/cash/api'
import { AppRoutes, RequireAnyRole } from './AppRoutes'

let auth = {
  status: 'checking' as 'checking' | 'authenticated' | 'unauthenticated',
  user: null as { roles: string[] } | null,
  hasAnyRole: vi.fn<(roles: string[]) => boolean>(() => false),
}
vi.mock('../features/auth/AuthProvider', () => ({ useAuth: () => auth }))
vi.mock('../pages/LoginPage', () => ({ LoginPage: () => <p>Login page</p> }))
vi.mock('../pages/InicioPage', () => ({ InicioPage: () => <p>Inicio page</p> }))
vi.mock('../pages/ForbiddenPage', () => ({ ForbiddenPage: () => <p>Forbidden page</p> }))
vi.mock('../pages/UiKitPage', () => ({ UiKitPage: () => <p>UI kit page</p> }))
vi.mock('../features/customers/CustomersPage', () => ({
  CustomersPage: () => <p>Customers page</p>,
}))
vi.mock('../features/sales/SalesHistoryPage', () => ({
  SalesHistoryPage: () => <p>Sales History page</p>,
}))
vi.mock('../features/attendance/AdministrativeAttendancePage', () => ({
  AdministrativeAttendancePage: () => <p>Administrative attendance page</p>,
}))
vi.mock('../features/attendance/AttendanceTodayPage', () => ({
  AttendanceTodayPage: () => <p>Attendance today page</p>,
}))
vi.mock('../features/reports/pages', () => ({
  SalesReportPage: () => <p>Sales report page</p>,
  InventoryReportPage: () => <p>Inventory report page</p>,
  AttendanceReportPage: () => <p>Attendance report page</p>,
}))
vi.mock('../features/cash/CashClosingHistoryPage', () => ({
  CashClosingHistoryPage: () => <p>Cash closing history page</p>,
}))
vi.mock('../features/cash/CashClosingPage', () => ({
  CashClosingPage: () => <p>Cash closing page</p>,
}))

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
  auth = {
    status: 'checking',
    user: null,
    hasAnyRole: vi.fn<(roles: string[]) => boolean>(() => false),
  }
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

  it.each([
    ['ADMINISTRADOR', true],
    ['ENCARGADO', true],
    ['CONTADORA', true],
    ['EMPLEADO', false],
  ])('wires /asistencia through its real role guard for %s', (role, allowed) => {
    auth.status = 'authenticated'
    auth.hasAnyRole = vi.fn((requiredRoles: string[]) => requiredRoles.includes(role))
    renderRoutes('/asistencia')

    if (allowed) {
      expect(screen.getByText('Administrative attendance page')).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/asistencia')
      expect(auth.hasAnyRole).toHaveBeenCalledWith(['ADMINISTRADOR', 'ENCARGADO', 'CONTADORA'])
    } else {
      expect(screen.getByText('Forbidden page')).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/403')
      expect(screen.queryByText('Administrative attendance page')).not.toBeInTheDocument()
    }
  })

  it.each([
    ['ADMINISTRADOR', true],
    ['ENCARGADO', true],
    ['CONTADORA', false],
    ['EMPLEADO', false],
  ])('wires /asistencia/hoy through its real role guard for %s', (role, allowed) => {
    auth.status = 'authenticated'
    auth.hasAnyRole = vi.fn((requiredRoles: string[]) => requiredRoles.includes(role))
    renderRoutes('/asistencia/hoy')

    if (allowed) {
      expect(screen.getByText('Attendance today page')).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/asistencia/hoy')
      expect(auth.hasAnyRole).toHaveBeenCalledWith(['ADMINISTRADOR', 'ENCARGADO'])
    } else {
      expect(screen.getByText('Forbidden page')).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/403')
      expect(screen.queryByText('Attendance today page')).not.toBeInTheDocument()
    }
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
    [['ADMINISTRADOR'], true],
    [['ENCARGADO'], true],
    [['CONTADORA'], true],
    [['MESERO'], false],
    [['COCINA'], false],
    [['EMPLEADO'], false],
    [['CONTADORA', 'ENCARGADO'], true],
  ])('protects /turnos/cierres for the CashHistory role union %s', (userRoles, allowed) => {
    auth.status = 'authenticated'
    auth.hasAnyRole = vi.fn((requiredRoles: string[]) =>
      requiredRoles.some((role) => userRoles.includes(role)),
    )
    renderRoutes('/turnos/cierres')

    if (allowed) {
      expect(screen.getByText('Cash closing history page')).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/turnos/cierres')
    } else {
      expect(screen.getByText('Forbidden page')).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/403')
      expect(screen.queryByText('Cash closing history page')).not.toBeInTheDocument()
    }
    expect(auth.hasAnyRole).toHaveBeenCalledWith([...CASH_HISTORY_READ_ROLES])
  })

  it('keeps CashManage and CashHistory route guards independent', () => {
    auth.status = 'authenticated'
    auth.hasAnyRole = vi.fn((requiredRoles: string[]) => requiredRoles.includes('CONTADORA'))
    renderRoutes('/turnos/cierre')
    expect(screen.getByText('Forbidden page')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/403')

    auth.hasAnyRole = vi.fn((requiredRoles: string[]) => requiredRoles.includes('CONTADORA'))
    renderRoutes('/turnos/cierres')
    expect(screen.getByText('Cash closing history page')).toBeInTheDocument()
  })

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

  it.each([
    ['/clientes', ['MESERO'], [...CUSTOMER_READ_ROLES], 'Customers page'],
    ['/historial-ventas', ['CONTADORA'], [...SALES_HISTORY_READ_ROLES], 'Sales History page'],
    [
      '/historial-ventas',
      ['MESERO', 'ENCARGADO'],
      [...SALES_HISTORY_READ_ROLES],
      'Sales History page',
    ],
  ])(
    'allows the protected feature route %s for its authorized role union',
    (path, roles, _allowed, page) => {
      auth.status = 'authenticated'
      auth.hasAnyRole = vi.fn((required: string[]) => required.some((role) => roles.includes(role)))
      renderRoutes(path)

      expect(screen.getByText(page)).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent(path)
    },
  )

  it.each([
    ['/clientes', ['CONTADORA']],
    ['/historial-ventas', ['COCINA']],
  ])('redirects a forbidden authenticated visitor from %s to 403', (path, roles) => {
    auth.status = 'authenticated'
    auth.hasAnyRole = vi.fn((required: string[]) => required.some((role) => roles.includes(role)))
    renderRoutes(path)

    expect(screen.getByText('Forbidden page')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/403')
  })

  it.each(['/clientes', '/historial-ventas'])(
    'redirects an anonymous visit to %s to Login',
    (path) => {
      auth.status = 'unauthenticated'
      renderRoutes(path)

      expect(screen.getByText('Login page')).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/login')
    },
  )

  it.each([
    ['/reportes/ventas', REPORT_SALES_READ_ROLES, 'Sales report page'],
    ['/reportes/inventario', REPORT_INVENTORY_READ_ROLES, 'Inventory report page'],
    ['/reportes/asistencia', REPORT_ATTENDANCE_READ_ROLES, 'Attendance report page'],
  ])('applies an independent report guard to %s', (path, allowedRoles, page) => {
    auth.status = 'authenticated'
    auth.user = { roles: ['COCINA'] }
    const cocinaAllowed = (allowedRoles as readonly string[]).includes('COCINA')
    auth.hasAnyRole = vi.fn(() => cocinaAllowed)
    renderRoutes(path)

    if (cocinaAllowed) {
      expect(screen.getByText(page)).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent(path)
    } else {
      expect(screen.getByText('Forbidden page')).toBeInTheDocument()
      expect(screen.getByTestId('location')).toHaveTextContent('/403')
    }
  })

  it.each([
    [['ADMINISTRADOR'], '/reportes/ventas', 'Sales report page'],
    [['COCINA'], '/reportes/inventario', 'Inventory report page'],
    [['CONTADORA'], '/reportes/ventas', 'Sales report page'],
  ])('redirects /reportes deterministically for %s', (roles, destination, page) => {
    auth.status = 'authenticated'
    auth.user = { roles }
    auth.hasAnyRole = vi.fn((required: string[]) => required.some((role) => roles.includes(role)))
    renderRoutes('/reportes')
    expect(screen.getByText(page)).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(destination)
  })

  it('redirects an authenticated EMPLEADO-only report visit to 403', () => {
    auth.status = 'authenticated'
    auth.user = { roles: ['EMPLEADO'] }
    auth.hasAnyRole.mockReturnValue(false)
    renderRoutes('/reportes')
    expect(screen.getByText('Forbidden page')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/403')
  })

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
