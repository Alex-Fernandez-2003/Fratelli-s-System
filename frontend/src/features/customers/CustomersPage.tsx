import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  UserRoundCheck,
  UserRoundX,
} from 'lucide-react'
import { useState } from 'react'
import { Button, Card, IconButton, Input, Select, StatusDot } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { DataTable, Modal, PageHeader } from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import { CustomerForm } from './CustomerForm'
import {
  type Customer,
  useActivateCustomer,
  useCreateCustomer,
  useCustomers,
  useDeactivateCustomer,
  useUpdateCustomer,
} from './api'

const pageSize = 20
const status = (customer: Customer) =>
  customer.isActive
    ? { label: 'Activo', tone: 'success' as const }
    : { label: 'Inactivo', tone: 'danger' as const }
const notes = (value: string | null) =>
  value ? (value.length > 80 ? `${value.slice(0, 80)}…` : value) : '—'

export function CustomersPage() {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize,
    search: '',
    isActive: undefined as boolean | undefined,
  })
  const [editing, setEditing] = useState<Customer | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [lifecycle, setLifecycle] = useState<Customer | null>(null)
  const [formError, setFormError] = useState<unknown>()
  const { user } = useAuth()
  const manageStatus =
    user?.roles.some((role) => role === 'ADMINISTRADOR' || role === 'ENCARGADO') ?? false
  const query = useCustomers(filters)
  const create = useCreateCustomer()
  const update = useUpdateCustomer()
  const activate = useActivateCustomer()
  const deactivate = useDeactivateCustomer()
  const items = query.data?.items ?? []
  const filtered = Boolean(filters.search || filters.isActive !== undefined)
  const change = (patch: Partial<typeof filters>) =>
    setFilters({ ...filters, ...patch, page: patch.page ?? 1 })
  const closeForm = () => {
    setEditing(null)
    setCreateOpen(false)
    setFormError(undefined)
  }
  const save = async (request: Parameters<typeof create.mutateAsync>[0]) => {
    try {
      if (createOpen) await create.mutateAsync(request)
      else if (editing) await update.mutateAsync({ id: editing.id, request })
      closeForm()
    } catch (error) {
      setFormError(error)
    }
  }
  const actions = (customer: Customer) => (
    <div className="flex gap-1">
      <IconButton
        label="Editar cliente"
        onClick={() => {
          setEditing(customer)
          setFormError(undefined)
        }}
      >
        <Pencil size={16} />
      </IconButton>
      {manageStatus && (
        <IconButton
          label={customer.isActive ? 'Desactivar cliente' : 'Activar cliente'}
          onClick={() => setLifecycle(customer)}
        >
          {customer.isActive ? <UserRoundX size={16} /> : <UserRoundCheck size={16} />}
        </IconButton>
      )}
    </div>
  )
  const columns = [
    { id: 'name', header: 'Nombre', cell: (c: Customer) => <strong>{c.name}</strong> },
    { id: 'ci', header: 'CI', cell: (c: Customer) => c.ci },
    { id: 'nit', header: 'NIT', cell: (c: Customer) => c.nit ?? '—' },
    {
      id: 'notes',
      header: 'Notas',
      cell: (c: Customer) => <span title={c.notes ?? undefined}>{notes(c.notes)}</span>,
    },
    { id: 'status', header: 'Estado', cell: (c: Customer) => <StatusDot {...status(c)} /> },
  ]
  const totalCount = Number(query.data?.totalCount ?? 0),
    totalPages = Math.max(1, Number(query.data?.totalPages ?? 1))
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Clientes"
        description="Gestioná los datos y disponibilidad de tus clientes."
        actions={
          <Button type="button" leftIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            Nuevo cliente
          </Button>
        }
      />
      <Card className="grid gap-3 md:grid-cols-[minmax(0,1fr)_15rem] md:items-end">
        <FormField label="Buscar cliente" leadingIcon={<Search size={16} />}>
          <Input
            value={filters.search}
            placeholder="Nombre, CI o NIT"
            onChange={(e) => change({ search: e.target.value })}
          />
        </FormField>
        <FormField label="Estado">
          <Select
            value={filters.isActive === undefined ? '' : String(filters.isActive)}
            onChange={(e) =>
              change({ isActive: e.target.value === '' ? undefined : e.target.value === 'true' })
            }
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </Select>
        </FormField>
        <div className="flex gap-2 md:col-span-2">
          <Button
            size="sm"
            variant={filters.isActive === true ? 'primary' : 'outline'}
            aria-pressed={filters.isActive === true}
            onClick={() => change({ isActive: true })}
          >
            Activos
          </Button>
          <Button
            size="sm"
            variant={filters.isActive === false ? 'primary' : 'outline'}
            aria-pressed={filters.isActive === false}
            onClick={() => change({ isActive: false })}
          >
            Inactivos
          </Button>
        </div>
      </Card>
      {query.isLoading && !query.data ? (
        <p role="status">Cargando clientes…</p>
      ) : query.error ? (
        <Card>
          <p role="alert">No se pudieron cargar los clientes.</p>
          <Button onClick={() => void query.refetch()}>Reintentar</Button>
        </Card>
      ) : !items.length ? (
        <Card className="text-center">
          <p>
            {filtered
              ? 'No hay resultados para estos filtros.'
              : 'Todavía no hay clientes registrados.'}
          </p>
          {filtered ? (
            <Button
              variant="outline"
              onClick={() => setFilters({ page: 1, pageSize, search: '', isActive: undefined })}
            >
              Limpiar filtros
            </Button>
          ) : (
            <Button onClick={() => setCreateOpen(true)}>Nuevo cliente</Button>
          )}
        </Card>
      ) : (
        <Card>
          <div className="hidden md:block">
            <DataTable columns={columns} rows={items} getRowId={(c) => c.id} actions={actions} />
          </div>
          <div className="grid gap-3 md:hidden">
            {items.map((c) => (
              <Card key={c.id} className="grid gap-2">
                <div className="flex justify-between gap-2">
                  <strong>{c.name}</strong>
                  <StatusDot {...status(c)} />
                </div>
                <span>CI: {c.ci}</span>
                <span>NIT: {c.nit ?? '—'}</span>
                <span className="text-text-muted">{notes(c.notes)}</span>
                {actions(c)}
              </Card>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-text-muted">
            <span>
              Mostrando {totalCount ? (filters.page - 1) * pageSize + 1 : 0}–
              {Math.min(filters.page * pageSize, totalCount)} de {totalCount}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={filters.page <= 1}
                onClick={() => change({ page: filters.page - 1 })}
                leftIcon={<ChevronLeft size={16} />}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={filters.page >= totalPages}
                onClick={() => change({ page: filters.page + 1 })}
                rightIcon={<ChevronRight size={16} />}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      )}
      <Modal
        open={createOpen || !!editing}
        title={createOpen ? 'Nuevo cliente' : 'Editar cliente'}
        onClose={closeForm}
      >
        <CustomerForm
          initial={editing ?? undefined}
          pending={create.isPending || update.isPending}
          serverError={formError}
          onSubmit={(request) => void save(request)}
          onCancel={closeForm}
        />
      </Modal>
      <Modal
        open={!!lifecycle}
        title={lifecycle?.isActive ? 'Desactivar cliente' : 'Activar cliente'}
        onClose={() => setLifecycle(null)}
      >
        <p>
          {lifecycle?.isActive
            ? 'El cliente dejará de estar disponible para nuevas ventas y conservará su historial.'
            : 'El cliente volverá a estar disponible para nuevas ventas.'}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setLifecycle(null)}>
            Cancelar
          </Button>
          <Button
            loading={activate.isPending || deactivate.isPending}
            onClick={() => {
              if (!lifecycle) return
              void (lifecycle.isActive ? deactivate : activate)
                .mutateAsync(lifecycle.id)
                .then(() => setLifecycle(null))
            }}
          >
            {lifecycle?.isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
