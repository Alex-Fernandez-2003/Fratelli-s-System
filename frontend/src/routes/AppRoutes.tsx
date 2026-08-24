import { Navigate, Route, Routes } from 'react-router-dom'
import { UiKitPage } from '../pages/UiKitPage'
export function AppRoutes() {
  return (
    <Routes>
      {import.meta.env.DEV && <Route path="/dev/ui-kit" element={<UiKitPage />} />}
      <Route
        path="*"
        element={<Navigate to={import.meta.env.DEV ? '/dev/ui-kit' : '/'} replace />}
      />
    </Routes>
  )
}
