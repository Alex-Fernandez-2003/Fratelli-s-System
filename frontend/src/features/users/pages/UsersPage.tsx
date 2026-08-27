import {
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  ShieldCheck,
  ShieldOff,
  UserCog,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import { DataTable, Modal, PageHeader } from '@/components/organisms'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  IconButton,
  Input,
  Label,
  Select,
  StatusDot,
} from '@/components/atoms'
import { FormError, FormField, PasswordInput, PasswordStrength } from '@/components/molecules'
import { HttpError } from '@/lib/api/http-client'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  useActivateUser,
  useCreateUser,
  useDeactivateUser,
  useSetUserPassword,
  useUpdateUser,
  useUsersList,
} from '../api/queries'
import type { components } from '@/types/api.generated'

type User = components['schemas']['UserDto']
type FormValue = { fullName: string; username: string; roles: string[] }
const roles = ['ADMINISTRADOR', 'ENCARGADO', 'MESERO', 'COCINA', 'CONTADORA', 'EMPLEADO']
const initialForm: FormValue = { fullName: '', username: '', roles: [] }
const message = (error: unknown) =>
  error instanceof HttpError && error.status === 409
    ? 'No se pudo completar la operación. Revisá el usuario o intentá nuevamente.'
    : 'No se pudo completar la operación. Intentá nuevamente.'

function RoleList({ roles: userRoles }: { roles: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {userRoles.map((role) => (
        <Badge key={role}>{role}</Badge>
      ))}
    </div>
  )
}
function UserForm({
  value,
  onChange,
  error,
}: {
  value: FormValue
  onChange: (value: FormValue) => void
  error?: string
}) {
  const toggle = (role: string) =>
    onChange({
      ...value,
      roles: value.roles.includes(role)
        ? value.roles.filter((item) => item !== role)
        : [...value.roles, role],
    })
  return (
    <div className="grid gap-4">
      <FormField label="Nombre completo" required>
        <Input
          value={value.fullName}
          onChange={(event) => onChange({ ...value, fullName: event.target.value })}
        />
      </FormField>
      <FormField label="Username" required>
        <Input
          value={value.username}
          onChange={(event) => onChange({ ...value, username: event.target.value })}
        />
      </FormField>
      <fieldset className="grid gap-2">
        <legend className="font-bold">Roles *</legend>
        {roles.map((role) => (
          <Label className="flex items-center gap-2" key={role}>
            <Checkbox checked={value.roles.includes(role)} onChange={() => toggle(role)} />
            {role}
          </Label>
        ))}
      </fieldset>
      {error && <FormError>{error}</FormError>}
    </div>
  )
}

export function UsersPage() {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    role: '',
    active: undefined as boolean | undefined,
  })
  const [form, setForm] = useState(initialForm)
  const [editing, setEditing] = useState<User | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [passwordUser, setPasswordUser] = useState<User | null>(null)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [confirmation, setConfirmation] = useState<{ user: User; activate: boolean } | null>(null)
  const [mutationError, setMutationError] = useState<string>()
  const { user: currentUser, refreshCurrentUser, clearLocalSession } = useAuth()
  const query = useUsersList(filters)
  const create = useCreateUser()
  const update = useUpdateUser()
  const passwordMutation = useSetUserPassword()
  const activate = useActivateUser()
  const deactivate = useDeactivateUser()
  const pending =
    create.isPending ||
    update.isPending ||
    passwordMutation.isPending ||
    activate.isPending ||
    deactivate.isPending
  const closeForm = () => {
    setCreateOpen(false)
    setEditing(null)
    setForm(initialForm)
    setMutationError(undefined)
  }
  const submitForm = async () => {
    if (!form.fullName.trim() || !form.username.trim() || !form.roles.length) {
      setMutationError('Completá los campos obligatorios y elegí al menos un rol.')
      return
    }
    try {
      if (editing) {
        const rolesChanged =
          editing.roles.slice().sort().join('|') !== form.roles.slice().sort().join('|')
        await update.mutateAsync({ id: editing.id, request: form })
        if (editing.id === currentUser?.id) {
          if (rolesChanged) await clearLocalSession()
          else await refreshCurrentUser()
        }
      } else await create.mutateAsync(form)
      closeForm()
    } catch (error) {
      setMutationError(message(error))
    }
  }
  const columns = [
    { id: 'fullName', header: 'Nombre completo', cell: (user: User) => user.fullName },
    { id: 'username', header: 'Usuario', cell: (user: User) => user.username },
    { id: 'roles', header: 'Roles', cell: (user: User) => <RoleList roles={user.roles} /> },
    {
      id: 'active',
      header: 'Estado',
      cell: (user: User) => (
        <StatusDot
          label={user.isActive ? 'Activo' : 'Inactivo'}
          tone={user.isActive ? 'success' : 'danger'}
        />
      ),
    },
  ]
  const totalPages = Number(query.data?.totalPages ?? 0)
  const totalCount = Number(query.data?.totalCount ?? 0)
  const firstResult = totalCount ? (filters.page - 1) * filters.pageSize + 1 : 0
  const lastResult = Math.min(filters.page * filters.pageSize, totalCount)
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Usuarios y roles"
        description="Administra cuentas, estado y permisos del sistema."
        actions={
          <Button
            type="button"
            onClick={() => {
              setForm(initialForm)
              setCreateOpen(true)
            }}
            leftIcon={<UserPlus size={16} />}
            className="w-full sm:w-auto"
          >
            Nuevo usuario
          </Button>
        }
      />
      <Card className="grid gap-4 border-border bg-surface-elevated/40 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_15rem_auto] md:items-end">
          <FormField label="Buscar usuario" leadingIcon={<Search aria-hidden="true" size={16} />}>
            <Input
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              placeholder="Buscar usuario..."
            />
          </FormField>
          <FormField label="Rol">
            <Select
              value={filters.role}
              onChange={(event) => setFilters({ ...filters, role: event.target.value, page: 1 })}
            >
              <option value="">Todos los roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </FormField>
          <fieldset className="grid gap-1.5">
            <legend className="font-bold">Estado</legend>
            <div
              className="grid grid-cols-3 rounded-md border border-border bg-surface p-1"
              role="group"
              aria-label="Estado de usuario"
            >
              {(
                [
                  ['Todos', undefined],
                  ['Activos', true],
                  ['Inactivos', false],
                ] as const
              ).map(([label, active]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={filters.active === active}
                  onClick={() => setFilters({ ...filters, active, page: 1 })}
                  className={`min-h-9 rounded px-2 text-sm font-bold ${filters.active === active ? 'bg-surface-elevated text-brand-orange shadow-sm' : 'text-text-muted hover:text-text'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        {query.isLoading ? (
          <p role="status">Cargando usuarios…</p>
        ) : query.error ? (
          <div role="alert">
            <p>No se pudieron cargar los usuarios.</p>
            <Button type="button" onClick={() => void query.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : !query.data?.items.length ? (
          <div className="text-center">
            <p>
              {filters.search || filters.role || filters.active !== undefined
                ? 'No hay resultados para estos filtros.'
                : 'Todavía no hay usuarios.'}
            </p>
            {(filters.search || filters.role || filters.active !== undefined) && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFilters({ page: 1, pageSize: 20, search: '', role: '', active: undefined })
                }
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <DataTable
                columns={columns}
                rows={query.data.items}
                getRowId={(user) => user.id}
                actions={(user) => (
                  <Actions
                    user={user}
                    onEdit={() => {
                      setEditing(user)
                      setForm({
                        fullName: user.fullName,
                        username: user.username,
                        roles: user.roles,
                      })
                      setMutationError(undefined)
                    }}
                    onPassword={() => {
                      setPasswordUser(user)
                      setPassword('')
                      setPasswordConfirmation('')
                      setMutationError(undefined)
                    }}
                    onLifecycle={() => setConfirmation({ user, activate: !user.isActive })}
                  />
                )}
              />
            </div>
            <div className="grid gap-3 md:hidden">
              {query.data.items.map((user) => (
                <Card key={user.id} className="grid gap-2">
                  <strong>{user.fullName}</strong>
                  <span>{user.username}</span>
                  <RoleList roles={user.roles} />
                  <StatusDot
                    label={user.isActive ? 'Activo' : 'Inactivo'}
                    tone={user.isActive ? 'success' : 'danger'}
                  />
                  <Actions
                    user={user}
                    onEdit={() => {
                      setEditing(user)
                      setForm({
                        fullName: user.fullName,
                        username: user.username,
                        roles: user.roles,
                      })
                    }}
                    onPassword={() => {
                      setPasswordUser(user)
                      setPassword('')
                      setPasswordConfirmation('')
                    }}
                    onLifecycle={() => setConfirmation({ user, activate: !user.isActive })}
                  />
                </Card>
              ))}
            </div>
          </>
        )}
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-text-muted">
            Mostrando {firstResult}–{lastResult} de {totalCount} usuarios
          </span>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              leftIcon={<ChevronLeft size={16} />}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={filters.page >= totalPages}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              rightIcon={<ChevronRight size={16} />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>
      <Modal
        open={createOpen || !!editing}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
        onClose={closeForm}
      >
        <UserForm value={form} onChange={setForm} error={mutationError} />
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={closeForm}>
            Cancelar
          </Button>
          <Button type="button" loading={pending} onClick={() => void submitForm()}>
            Guardar
          </Button>
        </div>
      </Modal>
      <Modal
        open={!!passwordUser}
        title={passwordUser?.hasPassword ? 'Restablecer contraseña' : 'Establecer contraseña'}
        onClose={() => {
          setPasswordUser(null)
          setPassword('')
          setPasswordConfirmation('')
          setMutationError(undefined)
        }}
      >
        <FormField label="Nueva contraseña" error={mutationError}>
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="Confirmar contraseña">
          <PasswordInput
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <PasswordStrength value={password} />
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            loading={passwordMutation.isPending}
            onClick={() => {
              if (!passwordUser || password.length < 8) {
                setMutationError('La contraseña debe tener al menos 8 caracteres.')
                return
              }
              if (password !== passwordConfirmation) {
                setMutationError('Las contraseñas no coinciden.')
                return
              }
              void passwordMutation
                .mutateAsync({ id: passwordUser.id, request: { newPassword: password } })
                .then(async () => {
                  if (passwordUser.id === currentUser?.id) await clearLocalSession()
                  setPasswordUser(null)
                  setPassword('')
                  setPasswordConfirmation('')
                })
                .catch((error: unknown) => setMutationError(message(error)))
            }}
          >
            Guardar contraseña
          </Button>
        </div>
      </Modal>
      <Modal
        open={!!confirmation}
        title={confirmation?.activate ? 'Activar usuario' : 'Desactivar usuario'}
        onClose={() => setConfirmation(null)}
      >
        <p>
          {confirmation?.activate
            ? 'El usuario podrá volver a iniciar sesión.'
            : 'El usuario perderá acceso a la aplicación.'}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setConfirmation(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            loading={activate.isPending || deactivate.isPending}
            onClick={() => {
              if (!confirmation) return
              const mutation = confirmation.activate ? activate : deactivate
              void mutation
                .mutateAsync(confirmation.user.id)
                .then(() => setConfirmation(null))
                .catch((error: unknown) => setMutationError(message(error)))
            }}
          >
            {confirmation?.activate ? 'Activar' : 'Desactivar'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
function Actions({
  user,
  onEdit,
  onPassword,
  onLifecycle,
}: {
  user: User
  onEdit: () => void
  onPassword: () => void
  onLifecycle: () => void
}) {
  return (
    <div className="flex gap-1">
      <IconButton type="button" label="Editar usuario" onClick={onEdit}>
        <UserCog size={16} />
      </IconButton>
      <IconButton
        type="button"
        label={user.hasPassword ? 'Restablecer contraseña' : 'Establecer contraseña'}
        onClick={onPassword}
      >
        <Shield size={16} />
      </IconButton>
      <IconButton
        type="button"
        label={user.isActive ? 'Desactivar usuario' : 'Activar usuario'}
        onClick={onLifecycle}
      >
        {user.isActive ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
      </IconButton>
    </div>
  )
}
