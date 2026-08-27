import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Spinner } from '../components/atoms'
import { useAuth } from '../features/auth/AuthProvider'
import { AuthenticatedLayout } from '../features/navigation'

// Páginas generales
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { InicioPage } from '../pages/InicioPage'
import { LoginPage } from '../pages/LoginPage'
import { UiKitPage } from '../pages/UiKitPage'

// Páginas de características (Features)
import { KitchenPage } from '../features/kitchen/pages'
import { NewOrderPage, OrderDetailPage, OrdersPage } from '../features/orders/pages'
import { ProductsPage } from '../features/products/pages'
import { UsersPage } from '../features/users/pages/UsersPage'

function Bootstrap() {
  return (
    <main
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Comprobando sesión"
    >
      <Spinner label="Comprobando sesión" />
    </main>
  )
}

export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'checking') return <Bootstrap />

  return status === 'authenticated' ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  )
}

export function RequireAnyRole({ roles }: { roles: string[] }) {
  const { status, hasAnyRole } = useAuth()

  if (status === 'checking') return <Bootstrap />

  return hasAnyRole(roles) ? <Outlet /> : <Navigate to="/403" replace />
}

function LoginRoute() {
  const { status } = useAuth()

  return status === 'checking' ? (
    <Bootstrap />
  ) : status === 'authenticated' ? (
    <Navigate to="/inicio" replace />
  ) : (
    <LoginPage />
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {import.meta.env.DEV && <Route path="/dev/ui-kit" element={<UiKitPage />} />}
      <Route path="/login" element={<LoginRoute />} />

      {/* Rutas protegidas por sesión */}
      <Route element={<RequireAuth />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/inicio" element={<InicioPage />} />

          {/* Pedidos */}
          <Route element={<RequireAnyRole roles={['MESERO', 'ENCARGADO', 'ADMINISTRADOR']} />}>
            <Route path="/pedidos" element={<OrdersPage />} />
            <Route path="/pedidos/nuevo" element={<NewOrderPage />} />
            <Route path="/pedidos/:id" element={<OrderDetailPage />} />
          </Route>

          {/* Productos */}
          <Route element={<RequireAnyRole roles={['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA']} />}>
            <Route path="/productos" element={<ProductsPage />} />
          </Route>

          {/* Cocina */}
          <Route element={<RequireAnyRole roles={['COCINA', 'MESERO', 'ENCARGADO', 'ADMINISTRADOR']} />}>
            <Route path="/cocina" element={<KitchenPage />} />
          </Route>

          {/* Gestión de usuarios */}
          <Route element={<RequireAnyRole roles={['ADMINISTRADOR']} />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      {/* Manejo de errores y fallbacks */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}