<<<<<<< Updated upstream
import { Building2, MoreVertical } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button } from '../../components/atoms'
import { Pagination, SearchInput } from '../../components/molecules'
import { DataTable, Modal, PageHeader } from '../../components/organisms'
import { useAuth } from '../../features/auth/AuthProvider'
=======
import { useState } from 'react'
import { Badge, Button } from '../../components/atoms'
import { PrimaryNav, SearchInput } from '../../components/molecules'
import { AppShell } from '../../components/templates'
import { DataTable, Modal, PageHeader } from '../../components/organisms'
import { Pagination } from '../../components/molecules'
import { useAuth } from '../../features/auth/AuthProvider'

import { useSuppliers, useSupplierMutations } from '../../features/proveedores/hooks'
>>>>>>> Stashed changes
import { SupplierFormFields } from '../../features/proveedores/components/SupplierFormFields'
import {
  ConfirmDeactivateDialog,
  SuppliersEmptyState,
  SuppliersErrorState,
  SuppliersLoadingSkeleton,
} from '../../features/proveedores/components/SupplierListStates'
<<<<<<< Updated upstream
import { useSuppliers, useSupplierMutations } from '../../features/proveedores/hooks'
import { SUPPLIER_WRITE_ROLES, type Supplier } from '../../features/proveedores/types'
import { HttpError } from '../../lib/api/http-client'

const PAGE_SIZE = 10
type EstadoFiltro = 'activos' | 'inactivos'

function toServerErrorMessage(error: unknown): string {
  if (!(error instanceof HttpError)) return 'Ocurrió un error inesperado. Intenta de nuevo.'
  if (error.status === 409)
    return 'La operación entra en conflicto con una regla de negocio existente.'
  if (error.status === 404) return 'El proveedor ya no existe. Actualiza la lista.'
  if (error.status === 403) return 'No tienes permiso para realizar esta acción.'
  return (
    error.problem.detail ?? error.problem.title ?? 'Ocurrió un error inesperado. Intenta de nuevo.'
  )
}

function SupplierCard({
  supplier,
  canWrite,
  onEdit,
  onDeactivate,
}: {
  supplier: Supplier
  canWrite: boolean
  onEdit: (supplier: Supplier) => void
  onDeactivate: (supplier: Supplier) => void
}) {
  const contact = supplier.phoneNumber || supplier.email
  return (
    <article className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-elevated text-text-muted">
          <Building2 aria-hidden={true} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="m-0 truncate text-base font-bold">{supplier.name}</h2>
          {contact && <p className="mt-1 truncate text-sm text-text-muted">{contact}</p>}
        </div>
        {canWrite && (
          <details className="relative shrink-0">
            <summary
              aria-label={`Acciones para ${supplier.name}`}
              className="list-none rounded-lg p-2 text-text-muted hover:bg-surface-elevated"
            >
              <MoreVertical aria-hidden={true} size={18} />
            </summary>
            <div className="absolute right-0 z-10 mt-1 grid min-w-32 gap-1 rounded-lg border border-border bg-surface-elevated p-1 shadow-xl">
              <Button size="sm" variant="ghost" onClick={() => onEdit(supplier)}>
                Editar
              </Button>
              {supplier.isActive && (
                <Button size="sm" variant="ghost" onClick={() => onDeactivate(supplier)}>
                  Desactivar
                </Button>
              )}
            </div>
          </details>
        )}
      </div>
      <div className="mt-4">
        <Badge tone={supplier.isActive ? 'success' : 'danger'}>
          {supplier.isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>
      {supplier.notes && (
        <p className="mt-4 rounded-lg bg-brand-black/50 p-3 text-sm leading-6 text-text-muted">
          {supplier.notes}
        </p>
      )}
    </article>
  )
=======
import { SUPPLIER_WRITE_ROLES } from '../../features/proveedores/types'
import type { Supplier } from '../../features/proveedores/types'
import { HttpError } from '../../lib/api/http-client'

const PAGE_SIZE = 10

type EstadoFiltro = 'activos' | 'inactivos'

function toServerErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 409) return 'La operación entra en conflicto con una regla de negocio existente.'
    if (error.status === 404) return 'El proveedor ya no existe. Actualiza la lista.'
    if (error.status === 403) return 'No tienes permiso para realizar esta acción.'
    return error.problem.detail ?? error.problem.title ?? 'Ocurrió un error inesperado. Intenta de nuevo.'
  }
  return 'Ocurrió un error inesperado. Intenta de nuevo.'
>>>>>>> Stashed changes
}

export function SuppliersPage() {
  const { hasAnyRole } = useAuth()
  const canWrite = hasAnyRole([...SUPPLIER_WRITE_ROLES])
<<<<<<< Updated upstream
  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState<EstadoFiltro>('activos')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Supplier | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [toDeactivate, setToDeactivate] = useState<Supplier | null>(null)
  const [listError, setListError] = useState<string | null>(null)
=======

  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState<EstadoFiltro>('activos')
  const [page, setPage] = useState(1)

  const [editing, setEditing] = useState<Supplier | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [toDeactivate, setToDeactivate] = useState<Supplier | null>(null)
  const [listError, setListError] = useState<string | null>(null)

>>>>>>> Stashed changes
  const { data, isLoading, isError, refetch } = useSuppliers({
    search: search || undefined,
    isActive: estado === 'activos',
    page,
    pageSize: PAGE_SIZE,
  })
<<<<<<< Updated upstream
  const { create, update, deactivate } = useSupplierMutations()
  const items = data?.items ?? []
  const showEmpty = !isLoading && !isError && items.length === 0
=======

  const { create, update, deactivate } = useSupplierMutations()
>>>>>>> Stashed changes

  function openCreate() {
    setEditing(null)
    setFormError(null)
    setFormOpen(true)
  }
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
  function openEdit(supplier: Supplier) {
    setEditing(supplier)
    setFormError(null)
    setFormOpen(true)
  }
<<<<<<< Updated upstream
  async function handleSubmit(input: Parameters<typeof create.mutateAsync>[0]) {
    try {
      if (editing) await update.mutateAsync({ id: editing.id, input })
      else await create.mutateAsync(input)
=======

  async function handleSubmit(input: Parameters<typeof create.mutateAsync>[0]) {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, input })
      } else {
        await create.mutateAsync(input)
      }
>>>>>>> Stashed changes
      setFormOpen(false)
    } catch (error) {
      setFormError(toServerErrorMessage(error))
    }
  }
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
  async function handleConfirmDeactivate() {
    if (!toDeactivate) return
    try {
      await deactivate.mutateAsync(toDeactivate.id)
      setToDeactivate(null)
    } catch (error) {
      setListError(toServerErrorMessage(error))
      setToDeactivate(null)
      refetch()
    }
  }

<<<<<<< Updated upstream
  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <PageHeader
        title="Proveedores"
        description="Gestiona los proveedores utilizados en compras y suministros."
        actions={
          canWrite ? (
            <Button onClick={openCreate} className="w-full sm:w-auto">
              + Nuevo proveedor
            </Button>
          ) : undefined
        }
      />
      {listError && <p role="alert">{listError}</p>}
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
=======
  const items = data?.items ?? []
  const showEmpty = !isLoading && !isError && items.length === 0

  return (
    <AppShell
      header={
        <PageHeader
          title="Proveedores"
          description="Gestiona los proveedores utilizados en compras y suministros."
          actions={canWrite ? <Button onClick={openCreate}>+ Nuevo proveedor</Button> : undefined}
        />
      }
      navigation={
        <PrimaryNav
          items={[
            { label: 'Inicio', href: '/inicio' },
            { label: 'Proveedores', href: '/proveedores' },
          ]}
        />
      }
    >
      {listError && <p role="alert">{listError}</p>}

      <div className="flex gap-3">
>>>>>>> Stashed changes
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Buscar por nombre o teléfono"
          aria-label="Buscar por nombre o teléfono"
        />
<<<<<<< Updated upstream
        <div role="group" aria-label="Filtrar por estado" className="grid grid-cols-2 gap-2">
=======
        <div role="tablist" aria-label="Filtrar por estado" className="flex gap-2">
>>>>>>> Stashed changes
          <Button
            variant={estado === 'activos' ? 'primary' : 'ghost'}
            aria-pressed={estado === 'activos'}
            onClick={() => {
              setEstado('activos')
              setPage(1)
            }}
          >
            Activos
          </Button>
          <Button
            variant={estado === 'inactivos' ? 'primary' : 'ghost'}
            aria-pressed={estado === 'inactivos'}
            onClick={() => {
              setEstado('inactivos')
              setPage(1)
            }}
          >
            Inactivos
          </Button>
        </div>
      </div>
<<<<<<< Updated upstream
      {isLoading && <SuppliersLoadingSkeleton />}
      {isError && <SuppliersErrorState onRetry={() => refetch()} />}
      {showEmpty && <SuppliersEmptyState canWrite={canWrite} onCreate={openCreate} />}
      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="hidden md:block">
            <DataTable
              columns={[
                { id: 'name', header: 'Nombre del proveedor', cell: (row: Supplier) => row.name },
                { id: 'phone', header: 'Teléfono', cell: (row: Supplier) => row.phoneNumber },
                { id: 'email', header: 'Correo', cell: (row: Supplier) => row.email ?? '—' },
                { id: 'notes', header: 'Notas', cell: (row: Supplier) => row.notes ?? '—' },
                {
                  id: 'status',
                  header: 'Estado',
                  cell: (row: Supplier) => (
                    <Badge tone={row.isActive ? 'success' : 'danger'}>
                      {row.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  ),
                },
              ]}
              rows={items}
              getRowId={(row) => row.id}
              actions={
                canWrite
                  ? (row) => (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                          Editar
                        </Button>
                        {row.isActive && (
                          <Button size="sm" variant="ghost" onClick={() => setToDeactivate(row)}>
                            Desactivar
                          </Button>
                        )}
                      </div>
                    )
                  : undefined
              }
            />
          </div>
          <div className="grid gap-4 md:hidden">
            {items.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                canWrite={canWrite}
                onEdit={openEdit}
                onDeactivate={setToDeactivate}
              />
            ))}
          </div>
=======

      {isLoading && <SuppliersLoadingSkeleton />}
      {isError && <SuppliersErrorState onRetry={() => refetch()} />}
      {showEmpty && <SuppliersEmptyState canWrite={canWrite} onCreate={openCreate} />}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <DataTable
            columns={[
              { id: 'name', header: 'Nombre del proveedor', cell: (row: Supplier) => row.name },
              { id: 'phone', header: 'Teléfono', cell: (row: Supplier) => row.phoneNumber },
              { id: 'email', header: 'Correo', cell: (row: Supplier) => row.email ?? '—' },
              { id: 'notes', header: 'Notas', cell: (row: Supplier) => row.notes ?? '—' },
              {
                id: 'status',
                header: 'Estado',
                cell: (row: Supplier) => (
                  <Badge tone={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Activo' : 'Inactivo'}</Badge>
                ),
              },
            ]}
            rows={items}
            getRowId={(row) => row.id}
            actions={
              canWrite
                ? (row: Supplier) => (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(row)}>
                        Editar
                      </Button>
                      {row.isActive && (
                        <Button size="sm" variant="ghost" onClick={() => setToDeactivate(row)}>
                          Desactivar
                        </Button>
                      )}
                    </div>
                  )
                : undefined
            }
          />

>>>>>>> Stashed changes
          {data && data.totalPages > 1 && (
            <Pagination page={data.page} pageCount={data.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
<<<<<<< Updated upstream
      {canWrite && (
        <Modal
          open={formOpen}
          title={editing ? 'Editar proveedor' : 'Nuevo proveedor'}
          onClose={() => setFormOpen(false)}
        >
          <SupplierFormFields
            key={editing?.id ?? 'create'}
            initial={editing}
            submitting={create.isPending || update.isPending}
            serverError={formError}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
          />
        </Modal>
      )}
      {canWrite && (
        <ConfirmDeactivateDialog
          supplier={toDeactivate}
          pending={deactivate.isPending}
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setToDeactivate(null)}
        />
      )}
    </div>
=======

      <Modal open={formOpen} title={editing ? 'Editar proveedor' : 'Nuevo proveedor'} onClose={() => setFormOpen(false)}>
        <SupplierFormFields
          key={editing?.id ?? 'create'}
          initial={editing}
          submitting={create.isPending || update.isPending}
          serverError={formError}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDeactivateDialog
        supplier={toDeactivate}
        pending={deactivate.isPending}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setToDeactivate(null)}
      />
    </AppShell>
>>>>>>> Stashed changes
  )
}
