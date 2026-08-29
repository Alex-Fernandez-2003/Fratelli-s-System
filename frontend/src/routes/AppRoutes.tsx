import { Navigate, Route, Routes } from 'react-router-dom'
import { RegisterProductionPage } from '../features/production'
import { UiKitPage } from '../pages/UiKitPage'
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/produccion/registrar" element={<RegisterProductionPage />} />
      {import.meta.env.DEV && <Route path="/dev/ui-kit" element={<UiKitPage />} />}
      <Route
        path="*"
        element={<Navigate to={import.meta.env.DEV ? '/dev/ui-kit' : '/'} replace />}
      />
    </Routes>
  )
}
