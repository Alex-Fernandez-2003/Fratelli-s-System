import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Spinner } from '../components/atoms'
import { useAuth } from '../features/auth/AuthProvider'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { InicioPage } from '../pages/InicioPage'
import { LoginPage } from '../pages/LoginPage'
import { UiKitPage } from '../pages/UiKitPage'

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
      <Route element={<RequireAuth />}>
        <Route path="/inicio" element={<InicioPage />} />
      </Route>
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}
