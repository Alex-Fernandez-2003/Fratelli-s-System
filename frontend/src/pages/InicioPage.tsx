import { useAuth } from '../features/auth/AuthProvider'

export function InicioPage() {
  const { user, error } = useAuth()
  return (
    <>
      <header>
        <h1>Inicio</h1>
        <p className="text-text-muted">Sesión autenticada</p>
      </header>
      {error && <p role="alert">{error}</p>}
      <section className="rounded-lg border border-border bg-surface p-4 shadow-[0_0.25rem_1rem_rgb(0_0_0_/_15%)]">
        <h2>Bienvenido, {user?.fullName ?? user?.username}</h2>
        <p>Roles: {user?.roles.join(', ')}</p>
      </section>
    </>
  )
}
