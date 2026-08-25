import { ArrowRight, Info, LockKeyhole, UserRound, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Button, Input, Spinner } from '../components/atoms'
import { Alert, FormField, PasswordInput } from '../components/molecules'
import { AuthLayout } from '../components/templates'
import { useAuth } from '../features/auth/AuthProvider'

export function LoginPage() {
  const { login, pending, error } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const usernameError = submitted && !username.trim() ? 'El usuario es obligatorio.' : undefined

  const passwordError = submitted && !password ? 'La contraseña es obligatoria.' : undefined

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)

    if (!username.trim() || !password || pending) return

    try {
      await login({ username, password })
    } catch {
      /* Provider exposes controlled error. */
    }
  }

  return (
    <AuthLayout
      integrated
      title="Iniciar sesión"
      branding={
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-7 flex size-[78px] items-center justify-center rounded-2xl border border-border bg-surface-elevated text-brand-orange"
            aria-hidden="true"
          >
            <Utensils size={32} strokeWidth={2.2} />
          </div>

          <h1 className="m-0 text-[1.9rem] font-bold leading-tight tracking-[-0.03em] text-text">
            Restaurant System
          </h1>

          <p className="mt-3 mb-0 text-[1.2rem] font-normal text-text-muted">Fratelli</p>
        </div>
      }
    >
      <div className="mt-12 w-full rounded-[24px] border border-border bg-surface px-10 py-10 shadow-[0_18px_45px_rgba(0,0,0,0.28)] max-[480px]:mt-10 max-[480px]:rounded-[22px] max-[480px]:px-6 max-[480px]:py-9">
        <div className="mb-9 text-center">
          <h2 className="m-0 text-[1.8rem] font-bold leading-tight tracking-[-0.02em] text-text max-[480px]:text-[1.65rem]">
            Iniciar sesión
          </h2>

          <p className="mt-4 mb-0 text-[1rem] leading-relaxed text-text-muted">
            Accede con tus credenciales para continuar
          </p>
        </div>

        <form className="grid gap-6" onSubmit={submit} noValidate>
          {error && <Alert kind="error">{error}</Alert>}

          <FormField
            label="Identificador de acceso"
            required
            error={usernameError}
            leadingIcon={<UserRound size={19} />}
          >
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="Ingresa tu ID"
              required
            />
          </FormField>

          <FormField
            label="Contraseña"
            required
            error={passwordError}
            leadingIcon={<LockKeyhole size={19} />}
          >
            <PasswordInput
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              required
            />
          </FormField>

          <div className="pt-4">
            <Button type="submit" fullWidth loading={pending} rightIcon={<ArrowRight size={19} />}>
              {pending ? 'Ingresando' : 'Iniciar sesión'}
            </Button>
          </div>

          {pending && (
            <span className="sr-only">
              <Spinner label="Iniciando sesión" />
            </span>
          )}
        </form>
      </div>

      <p className="mx-auto mt-10 flex max-w-[430px] items-start justify-center gap-3 text-center text-[0.95rem] leading-[1.65] text-text-muted max-[480px]:mt-9 max-[480px]:text-[0.9rem]">
        <span className="mt-[0.3rem] shrink-0 text-text-muted" aria-hidden="true">
          <Info size={15} />
        </span>

        <span>Contacta al administrador si necesitas restablecer tu acceso</span>
      </p>
    </AuthLayout>
  )
}
