import { Link } from 'react-router-dom'
import { AuthLayout } from '../components/templates'
export function ForbiddenPage() {
  return (
    <AuthLayout
      title="Acceso denegado"
      description="No tienes permisos para acceder a esta sección."
    >
      <Link
        className="inline-flex items-center justify-center rounded-md border border-transparent bg-brand-orange px-3.5 py-2.5 font-bold text-brand-black no-underline hover:bg-brand-orange-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
        to="/inicio"
      >
        Volver al inicio
      </Link>
    </AuthLayout>
  )
}
