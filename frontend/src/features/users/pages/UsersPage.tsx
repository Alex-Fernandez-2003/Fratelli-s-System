import {
  ChevronLeft,
  ChevronRight,
  Search,
  KeyRound,
  Pencil,
  UserX,
  UserPlus,
  UserPen,
  Info,
  MoreVertical,
} from 'lucide-react'
import UserCheck from '@/assets/user-check.svg?react'
import Key from '@/assets/key.svg?react'
import Lock from '@/assets/lock.svg?react'
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
import {
  FormError,
  FormField,
  PasswordInput,
  PasswordStrength,
} from '@/components/molecules'
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

type FormValue = {
  fullName: string
  username: string
  roles: string[]
}

const roles = [
  'ADMINISTRADOR',
  'ENCARGADO',
  'MESERO',
  'COCINA',
  'CONTADORA',
  'EMPLEADO',
]

const initialForm: FormValue = {
  fullName: '',
  username: '',
  roles: [],
}

const message = (error: unknown) =>
  error instanceof HttpError && error.status === 409
    ? 'No se pudo completar la operación. Revisá el usuario o intentá nuevamente.'
    : 'No se pudo completar la operación. Intentá nuevamente.'

function RoleList({ roles: userRoles }: { roles: string[] }) {
  return (
    <div className="flex min-w-0 max-w-full flex-wrap gap-1">
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
          onChange={(event) =>
            onChange({
              ...value,
              fullName: event.target.value,
            })
          }
        />
      </FormField>

      <FormField label="Username" required>
        <Input
          value={value.username}
          onChange={(event) =>
            onChange({
              ...value,
              username: event.target.value,
            })
          }
        />
      </FormField>

      <fieldset className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <legend className="text-sm font-bold uppercase tracking-wide text-text">
            Asignar roles *
          </legend>

          <span className="text-sm italic text-text-muted">
            Selecciona uno o varios
          </span>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
          {roles.map((role) => {
            const checked = value.roles.includes(role)

            return (
              <Label
                key={role}
                className={`
                  flex min-h-14 min-w-0 cursor-pointer items-center gap-3
                  rounded-xl border px-4 py-3
                  transition-all duration-200
                  ${checked
                    ? 'border-brand-orange bg-brand-orange/5 text-text'
                    : 'border-border bg-surface text-text-muted hover:border-brand-orange/60 hover:bg-surface-elevated/40 hover:text-text'
                  }
                  focus-within:outline-2
                  focus-within:outline-offset-2
                  focus-within:outline-brand-orange
                `}
              >
                <Checkbox
                  checked={checked}
                  onChange={() => toggle(role)}
                />

                <span className="min-w-0 font-semibold">
                  {role}
                </span>
              </Label>
            )
          })}
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-info/30 bg-info/10 px-4 py-3 text-sm text-info">
          <Info
            className="size-4 shrink-0"
            aria-hidden="true"
          />

          <span>
            Los permisos se combinan cuando hay varios roles asignados.
          </span>
        </div>
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

  const [confirmation, setConfirmation] = useState<{
    user: User
    activate: boolean
  } | null>(null)

  const [mutationError, setMutationError] = useState<string>()

  const {
    user: currentUser,
    refreshCurrentUser,
    clearLocalSession,
  } = useAuth()

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

  const openCreateForm = () => {
    setEditing(null)
    setForm(initialForm)
    setMutationError(undefined)
    setCreateOpen(true)
  }

  const closeForm = () => {
    setCreateOpen(false)
    setEditing(null)
    setForm(initialForm)
    setMutationError(undefined)
  }

  const submitForm = async () => {
    if (
      !form.fullName.trim() ||
      !form.username.trim() ||
      !form.roles.length
    ) {
      setMutationError(
        'Completá los campos obligatorios y elegí al menos un rol.',
      )
      return
    }

    try {
      if (editing) {
        const rolesChanged =
          editing.roles.slice().sort().join('|') !==
          form.roles.slice().sort().join('|')

        await update.mutateAsync({
          id: editing.id,
          request: form,
        })

        if (editing.id === currentUser?.id) {
          if (rolesChanged) {
            await clearLocalSession()
          } else {
            await refreshCurrentUser()
          }
        }
      } else {
        await create.mutateAsync(form)
      }

      closeForm()
    } catch (error) {
      setMutationError(message(error))
    }
  }

  const columns = [
    {
      id: 'fullName',
      header: 'Nombre completo',
      cell: (user: User) => user.fullName,
    },
    {
      id: 'username',
      header: 'Usuario',
      cell: (user: User) => user.username,
    },
    {
      id: 'roles',
      header: 'Roles',
      cell: (user: User) => (
        <RoleList roles={user.roles} />
      ),
    },
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

  const firstResult = totalCount
    ? (filters.page - 1) * filters.pageSize + 1
    : 0

  const lastResult = Math.min(
    filters.page * filters.pageSize,
    totalCount,
  )

  return (
    <div className="grid gap-6">
      {/* ======================================================
          HEADER MOBILE
      ====================================================== */}
      <div className="grid gap-5 md:hidden">
        <div className="min-w-0">
          <h1 className="mb-1 text-3xl font-bold text-text">
            Usuarios y roles
          </h1>

          <p className="m-0 text-base text-text-muted">
            Administra cuentas, estado y permisos del sistema.
          </p>
        </div>

        <Button
          type="button"
          onClick={openCreateForm}
          leftIcon={<UserPlus size={18} />}
          className="w-full"
        >
          Nuevo usuario
        </Button>
      </div>

      {/* ======================================================
          HEADER DESKTOP
      ====================================================== */}
      <div className="hidden md:block">
        <PageHeader
          title="Usuarios y roles"
          description="Administra cuentas, estado y permisos del sistema."
          actions={
            <Button
              type="button"
              onClick={openCreateForm}
              leftIcon={<UserPlus size={16} />}
            >
              Nuevo usuario
            </Button>
          }
        />
      </div>

      {/* ======================================================
          FILTROS
      ====================================================== */}
      <Card className="border-border bg-surface-elevated/40 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_15rem_auto] md:items-end">
          <FormField
            label="Buscar usuario"
            leadingIcon={
              <Search
                aria-hidden="true"
                size={16}
              />
            }
          >
            <Input
              value={filters.search}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  search: event.target.value,
                  page: 1,
                })
              }
              placeholder="Buscar usuario..."
            />
          </FormField>

          <FormField label="Rol">
            <Select
              value={filters.role}
              onChange={(event) =>
                setFilters({
                  ...filters,
                  role: event.target.value,
                  page: 1,
                })
              }
            >
              <option value="">
                Todos los roles
              </option>

              {roles.map((role) => (
                <option
                  key={role}
                  value={role}
                >
                  {role}
                </option>
              ))}
            </Select>
          </FormField>

          <fieldset className="grid gap-1.5">
            <legend className="font-bold">
              Estado
            </legend>

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
                  onClick={() =>
                    setFilters({
                      ...filters,
                      active,
                      page: 1,
                    })
                  }
                  className={`min-h-9 rounded px-2 text-sm font-bold ${filters.active === active
                    ? 'bg-surface-elevated text-brand-orange shadow-sm'
                    : 'text-text-muted hover:text-text'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </Card>

      {/* ======================================================
          TABLA / CARDS DE USUARIOS
      ====================================================== */}
      <Card className="grid min-w-0 gap-4 border-border bg-surface-elevated/40 p-4 sm:p-5">
        {query.isLoading ? (
          <p role="status">
            Cargando usuarios…
          </p>
        ) : query.error ? (
          <div
            role="alert"
            className="grid gap-3"
          >
            <p>
              No se pudieron cargar los usuarios.
            </p>

            <div>
              <Button
                type="button"
                onClick={() => void query.refetch()}
              >
                Reintentar
              </Button>
            </div>
          </div>
        ) : !query.data?.items.length ? (
          <div className="grid gap-3 py-6 text-center">
            <p>
              {filters.search ||
                filters.role ||
                filters.active !== undefined
                ? 'No hay resultados para estos filtros.'
                : 'Todavía no hay usuarios.'}
            </p>

            {(filters.search ||
              filters.role ||
              filters.active !== undefined) && (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFilters({
                        page: 1,
                        pageSize: 20,
                        search: '',
                        role: '',
                        active: undefined,
                      })
                    }
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}
          </div>
        ) : (
          <>
            {/* Desktop */}
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
                    onLifecycle={() =>
                      setConfirmation({
                        user,
                        activate: !user.isActive,
                      })
                    }
                  />
                )}
              />
            </div>

            {/* ==================================================
                MOBILE
            ================================================== */}
            <div className="grid min-w-0 gap-4 md:hidden">
              {query.data.items.map((user) => {
                const initials = user.fullName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) =>
                    part[0]?.toUpperCase(),
                  )
                  .join('')

                return (
                  <Card
                    key={user.id}
                    className="grid min-w-0 gap-5 overflow-visible rounded-2xl p-5"
                  >
                    {/* Cabecera */}
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        {/* Avatar */}
                        <div
                          className="
                            flex size-14 shrink-0
                            items-center justify-center
                            rounded-full border border-border
                            bg-surface-elevated
                            text-sm font-bold text-text
                          "
                          aria-hidden="true"
                        >
                          {initials}
                        </div>

                        {/* Información */}
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-lg font-bold text-text">
                            {user.fullName}
                          </strong>

                          <span className="mt-0.5 block truncate text-sm text-text-muted">
                            {user.username}
                          </span>
                        </div>
                      </div>

                      <MobileUserActions
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
                        onLifecycle={() =>
                          setConfirmation({
                            user,
                            activate: !user.isActive,
                          })
                        }
                      />
                    </div>

                    {/* Roles + estado */}
                    <div
                      className="
                        grid min-w-0 gap-3
                        min-[420px]:grid-cols-[minmax(0,1fr)_auto]
                        min-[420px]:items-end
                      "
                    >
                      <div className="min-w-0 max-w-full overflow-visible">
                        <RoleList roles={user.roles} />
                      </div>

                      <div
                        className="
                          min-w-0 justify-self-start
                          min-[420px]:justify-self-end
                        "
                      >
                        <StatusDot
                          label={
                            user.isActive
                              ? 'Activo'
                              : 'Inactivo'
                          }
                          tone={
                            user.isActive
                              ? 'success'
                              : 'danger'
                          }
                        />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        {/* ======================================================
            PAGINACIÓN
        ====================================================== */}
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-text-muted">
            Mostrando {firstResult}–{lastResult} de{' '}
            {totalCount} usuarios
          </span>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() =>
                setFilters({
                  ...filters,
                  page: filters.page - 1,
                })
              }
              leftIcon={
                <ChevronLeft size={16} />
              }
            >
              Anterior
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={
                totalPages === 0 ||
                filters.page >= totalPages
              }
              onClick={() =>
                setFilters({
                  ...filters,
                  page: filters.page + 1,
                })
              }
              rightIcon={
                <ChevronRight size={16} />
              }
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>

      {/* ======================================================
          MODAL CREAR / EDITAR USUARIO
      ====================================================== */}
      <Modal
        open={createOpen || !!editing}
        title={
          editing
            ? 'Editar usuario'
            : 'Nuevo usuario'
        }
        subtitle={
          editing
            ? 'Modifica al personal'
            : 'Ingresa al nuevo personal'
        }
        icon={
          editing
            ? UserPen
            : UserPlus
        }
        onClose={closeForm}
      >
        <UserForm
          value={form}
          onChange={setForm}
          error={mutationError}
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeForm}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            loading={pending}
            onClick={() =>
              void submitForm()
            }
          >
            Guardar
          </Button>
        </div>
      </Modal>

      {/* ======================================================
          MODAL CONTRASEÑA
      ====================================================== */}
      <Modal
        open={!!passwordUser}
        title={
          passwordUser?.hasPassword
            ? 'Restablecer contraseña'
            : 'Establecer contraseña'
        }
        onClose={() => {
          setPasswordUser(null)
          setPassword('')
          setPasswordConfirmation('')
          setMutationError(undefined)
        }}
        subtitle="Establece una nueva credencial para el usuario. El sistema no muestra la contraseña anterior por seguridad."
        icon={Key}
      >
        <FormField
          label="Nueva contraseña"
          error={mutationError}
          leadingIcon={
            <Lock className="size-5" />
          }
        >
          <PasswordInput
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            autoComplete="new-password"
          />
        </FormField>

        <FormField
          label="Confirmar contraseña"
          leadingIcon={
            <Lock className="size-5" />
          }
        >
          <PasswordInput
            value={passwordConfirmation}
            onChange={(event) =>
              setPasswordConfirmation(
                event.target.value,
              )
            }
            autoComplete="new-password"
          />
        </FormField>

        <PasswordStrength value={password} />

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPasswordUser(null)
              setPassword('')
              setPasswordConfirmation('')
              setMutationError(undefined)
            }}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            loading={passwordMutation.isPending}
            onClick={() => {
              if (
                !passwordUser ||
                password.length < 8
              ) {
                setMutationError(
                  'La contraseña debe tener al menos 8 caracteres.',
                )
                return
              }

              if (
                password !==
                passwordConfirmation
              ) {
                setMutationError(
                  'Las contraseñas no coinciden.',
                )
                return
              }

              void passwordMutation
                .mutateAsync({
                  id: passwordUser.id,
                  request: {
                    newPassword: password,
                  },
                })
                .then(async () => {
                  if (
                    passwordUser.id ===
                    currentUser?.id
                  ) {
                    await clearLocalSession()
                  }

                  setPasswordUser(null)
                  setPassword('')
                  setPasswordConfirmation('')
                })
                .catch((error: unknown) =>
                  setMutationError(
                    message(error),
                  ),
                )
            }}
          >
            Guardar contraseña
          </Button>
        </div>
      </Modal>

      {/* ======================================================
          MODAL ACTIVAR / DESACTIVAR
      ====================================================== */}
      <Modal
        open={!!confirmation}
        title={
          confirmation?.activate
            ? 'Activar usuario'
            : 'Desactivar usuario'
        }
        onClose={() =>
          setConfirmation(null)
        }
        icon={
          confirmation?.activate
            ? UserCheck
            : UserX
        }
      >
        <p>
          {confirmation?.activate
            ? 'El usuario podrá volver a iniciar sesión.'
            : 'El usuario perderá acceso a la aplicación.'}
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setConfirmation(null)
            }
          >
            Cancelar
          </Button>

          <Button
            type="button"
            loading={
              activate.isPending ||
              deactivate.isPending
            }
            onClick={() => {
              if (!confirmation) return

              const mutation =
                confirmation.activate
                  ? activate
                  : deactivate

              void mutation
                .mutateAsync(
                  confirmation.user.id,
                )
                .then(() =>
                  setConfirmation(null),
                )
                .catch((error: unknown) =>
                  setMutationError(
                    message(error),
                  ),
                )
            }}
          >
            {confirmation?.activate
              ? 'Activar'
              : 'Desactivar'}
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
      <IconButton
        type="button"
        label="Editar usuario"
        onClick={onEdit}
      >
        <Pencil size={20} />
      </IconButton>

      <IconButton
        type="button"
        label={
          user.hasPassword
            ? 'Restablecer contraseña'
            : 'Establecer contraseña'
        }
        onClick={onPassword}
      >
        <KeyRound size={20} />
      </IconButton>

      <IconButton
        type="button"
        label={
          user.isActive
            ? 'Desactivar usuario'
            : 'Activar usuario'
        }
        onClick={onLifecycle}
      >
        {user.isActive ? (
          <UserX size={20} />
        ) : (
          <UserCheck className="size-5" />
        )}
      </IconButton>
    </div>
  )
}

function MobileUserActions({
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
  const runAction = (
    event: React.MouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    event.currentTarget
      .closest('details')
      ?.removeAttribute('open')

    action()
  }

  return (
    <details className="relative shrink-0">
      <summary
        className="
          flex size-10 cursor-pointer list-none
          items-center justify-center rounded-lg
          text-text-muted transition-colors
          hover:bg-surface-elevated hover:text-text
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-brand-orange
          [&::-webkit-details-marker]:hidden
        "
        aria-label="Acciones del usuario"
      >
        <MoreVertical
          className="size-5"
          aria-hidden="true"
        />
      </summary>

      <div
        className="
          absolute right-0 top-11 z-20
          min-w-52 overflow-hidden rounded-xl
          border border-border bg-surface-elevated
          p-1.5 shadow-lg
        "
      >
        <button
          type="button"
          className="
            flex w-full items-center gap-3
            rounded-lg px-3 py-2.5
            text-left text-sm text-text
            transition-colors hover:bg-surface
          "
          onClick={(event) =>
            runAction(event, onEdit)
          }
        >
          <Pencil
            className="size-4"
            aria-hidden="true"
          />
          Editar usuario
        </button>

        <button
          type="button"
          className="
            flex w-full items-center gap-3
            rounded-lg px-3 py-2.5
            text-left text-sm text-text
            transition-colors hover:bg-surface
          "
          onClick={(event) =>
            runAction(event, onPassword)
          }
        >
          <KeyRound
            className="size-4"
            aria-hidden="true"
          />

          {user.hasPassword
            ? 'Restablecer contraseña'
            : 'Establecer contraseña'}
        </button>

        <div className="my-1 border-t border-border" />

        <button
          type="button"
          className={`
            flex w-full items-center gap-3
            rounded-lg px-3 py-2.5
            text-left text-sm
            transition-colors hover:bg-surface
            ${user.isActive
              ? 'text-danger'
              : 'text-success'
            }
          `}
          onClick={(event) =>
            runAction(event, onLifecycle)
          }
        >
          {user.isActive ? (
            <UserX
              className="size-4"
              aria-hidden="true"
            />
          ) : (
            <UserCheck
              className="size-4"
              aria-hidden="true"
            />
          )}

          {user.isActive
            ? 'Desactivar usuario'
            : 'Activar usuario'}
        </button>
      </div>
    </details>
  )
}