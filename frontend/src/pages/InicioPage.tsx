import { Button } from '../components/atoms'
import { AppShell } from '../components/templates'
import { useAuth } from '../features/auth/AuthProvider'

export function InicioPage() {
  const { user, logout, pending, error } = useAuth()
  return (
    <AppShell
      header={
        <div className="flex items-start justify-between gap-4 [&_p]:text-text-muted">
          <div>
            <h1>Inicio</h1>
            <p>Sesión autenticada</p>
          </div>
          <Button onClick={() => void logout()} loading={pending}>
            Cerrar sesión
          </Button>
        </div>
      }
    >
      {error && <p role="alert">{error}</p>}
      <section className="rounded-lg border border-border bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(0_0_0_/_15%)]">
        <h2>Bienvenido, {user?.fullName ?? user?.username}</h2>
        <p>Roles: {user?.roles.join(', ')}</p>
      </section>
    </AppShell>
  )
}
