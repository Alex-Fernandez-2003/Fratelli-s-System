import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Spinner } from '../components/atoms'
import { useAuth } from '../features/auth/AuthProvider'
import {
  ATTENDANCE_ADMIN_ROLES,
  ATTENDANCE_MANAGE_ROLES,
  CUSTOMER_READ_ROLES,
  PRODUCT_READ_ROLES,
  SALES_HISTORY_READ_ROLES,
  PRODUCTION_HISTORY_READ_ROLES,
  EXPENSE_HISTORY_READ_ROLES,
  EXPENSE_WRITE_ROLES,
  AuthenticatedLayout,
} from '../features/navigation'
import { AttendanceTodayPage } from '../features/attendance/AttendanceTodayPage'
import { AdministrativeAttendancePage } from '../features/attendance/AdministrativeAttendancePage'
import { ForbiddenPage } from '../pages/ForbiddenPage'
import { InicioPage } from '../pages/InicioPage'
import { LoginPage } from '../pages/LoginPage'
import { SuppliersPage } from '../pages/proveedores/SuppliersPage'
import { MyAttendancePage } from '../pages/MyAttendancePage'
import { UiKitPage } from '../pages/UiKitPage'
import { KitchenPage } from '../features/kitchen/pages'
import { NewOrderPage, OrderDetailPage, OrdersPage } from '../features/orders/pages'
import { CheckoutPage } from '../features/sales/pages'
import { ProductsPage } from '../features/products/pages'
import { CompositionPage } from '../features/products/composition/CompositionPage'
import { UsersPage } from '../features/users/pages/UsersPage'
import { SUPPLIER_READ_ROLES } from '../features/proveedores/types'
import { InventoryBalancesPage, InventoryMovementsPage } from '../features/inventory/pages'
import { ExpensesPage } from '../features/expenses/pages'
import { HistoryPage as ExpensesHistoryPage } from '../features/expenses/HistoryPage'
import { NewPurchasePage, PurchasesPage, ReceivePurchasePage } from '../features/purchases/pages'
import { PURCHASE_READ_ROLES, PURCHASE_WRITE_ROLES } from '../features/purchases/api'
import {
  HistoryPage as ProductionHistoryPage,
  RegisterProductionPage,
} from '../features/production'
import { ShiftsPage } from '../features/shifts/ShiftsPage'
import { CustomersPage } from '../features/customers/CustomersPage'
import { SalesHistoryPage } from '../features/sales/SalesHistoryPage'
import { SHIFT_MANAGE_ROLES, SHIFT_OWN_READ_ROLES } from '../features/shifts/api'
import { MyShiftPage } from '../pages/MyShiftPage'
import { CashClosingPage } from '../features/cash/CashClosingPage'
import { CashClosingHistoryPage } from '../features/cash/CashClosingHistoryPage'
import { CASH_HISTORY_READ_ROLES } from '../features/cash/api'

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

          {/* Asistencia */}
          <Route path="/mi-asistencia" element={<MyAttendancePage />} />
          <Route element={<RequireAnyRole roles={[...ATTENDANCE_ADMIN_ROLES]} />}>
            <Route path="/asistencia" element={<AdministrativeAttendancePage />} />
          </Route>
          <Route element={<RequireAnyRole roles={[...ATTENDANCE_MANAGE_ROLES]} />}>
            <Route path="/asistencia/hoy" element={<AttendanceTodayPage />} />
          </Route>

          {/* Pedidos */}
          <Route element={<RequireAnyRole roles={['MESERO', 'ENCARGADO', 'ADMINISTRADOR']} />}>
            <Route path="/pedidos" element={<OrdersPage />} />
            <Route path="/pedidos/nuevo" element={<NewOrderPage />} />
            <Route path="/pedidos/:id" element={<OrderDetailPage />} />
            <Route path="/pedidos/:id/cobrar" element={<CheckoutPage />} />
          </Route>

          {/* Productos */}
          <Route element={<RequireAnyRole roles={[...PRODUCT_READ_ROLES]} />}>
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/productos/:id/composicion" element={<CompositionPage />} />
          </Route>

          <Route element={<RequireAnyRole roles={[...PRODUCTION_HISTORY_READ_ROLES]} />}>
            <Route path="/produccion" element={<ProductionHistoryPage />} />
          </Route>
          <Route element={<RequireAnyRole roles={['COCINA', 'ENCARGADO', 'ADMINISTRADOR']} />}>
            <Route path="/produccion/registrar" element={<RegisterProductionPage />} />
          </Route>

          {/* Inventario */}
          <Route
            element={
              <RequireAnyRole
                roles={['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA']}
              />
            }
          >
            <Route path="/inventario" element={<InventoryBalancesPage />} />
            <Route path="/inventario/movimientos" element={<InventoryMovementsPage />} />
          </Route>
          <Route element={<RequireAnyRole roles={[...EXPENSE_HISTORY_READ_ROLES]} />}>
            <Route path="/gastos/historial" element={<ExpensesHistoryPage />} />
          </Route>
          <Route element={<RequireAnyRole roles={[...EXPENSE_WRITE_ROLES]} />}>
            <Route path="/gastos" element={<ExpensesPage />} />
          </Route>

          {/* Cocina */}
          <Route
            element={<RequireAnyRole roles={['COCINA', 'MESERO', 'ENCARGADO', 'ADMINISTRADOR']} />}
          >
            <Route path="/cocina" element={<KitchenPage />} />
          </Route>

          {/* Gestión de usuarios */}
          <Route element={<RequireAnyRole roles={['ADMINISTRADOR']} />}>
            <Route path="/usuarios" element={<UsersPage />} />
          </Route>

          {/* Clientes */}
          <Route element={<RequireAnyRole roles={[...CUSTOMER_READ_ROLES]} />}>
            <Route path="/clientes" element={<CustomersPage />} />
          </Route>

          {/* Historial de ventas */}
          <Route element={<RequireAnyRole roles={[...SALES_HISTORY_READ_ROLES]} />}>
            <Route path="/historial-ventas" element={<SalesHistoryPage />} />
          </Route>

          {/* Proveedores */}
          <Route element={<RequireAnyRole roles={[...SUPPLIER_READ_ROLES]} />}>
            <Route path="/proveedores" element={<SuppliersPage />} />
          </Route>

          <Route element={<RequireAnyRole roles={[...PURCHASE_READ_ROLES]} />}>
            <Route path="/compras" element={<PurchasesPage />} />
          </Route>
          <Route element={<RequireAnyRole roles={[...PURCHASE_WRITE_ROLES]} />}>
            <Route path="/compras/nueva" element={<NewPurchasePage />} />
            <Route path="/compras/:id/recibir" element={<ReceivePurchasePage />} />
          </Route>

          {/* Turnos / Caja */}
          <Route element={<RequireAnyRole roles={[...SHIFT_OWN_READ_ROLES]} />}>
            <Route path="/mi-turno" element={<MyShiftPage />} />
          </Route>
          <Route element={<RequireAnyRole roles={[...CASH_HISTORY_READ_ROLES]} />}>
            <Route path="/turnos/cierres" element={<CashClosingHistoryPage />} />
          </Route>
          <Route element={<RequireAnyRole roles={[...SHIFT_MANAGE_ROLES]} />}>
            <Route path="/turnos" element={<ShiftsPage />} />
            <Route path="/turnos/cierre" element={<CashClosingPage />} />
          </Route>
        </Route>
      </Route>

      {/* Manejo de errores y fallbacks */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  )
}
