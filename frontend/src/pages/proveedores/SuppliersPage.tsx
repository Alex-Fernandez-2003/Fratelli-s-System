import { useState } from 'react'
import { Badge, Button } from '../../components/atoms'
import { PrimaryNav, SearchInput } from '../../components/molecules'
import { AppShell } from '../../components/templates'
import { DataTable, Modal, PageHeader } from '../../components/organisms'
import { Pagination } from '../../components/molecules'
import { useAuth } from '../../features/auth/AuthProvider'

import { useSuppliers, useSupplierMutations } from '../../features/proveedores/hooks'
import { SupplierFormFields } from '../../features/proveedores/components/SupplierFormFields'
import {
  ConfirmDeactivateDialog,
  SuppliersEmptyState,
  SuppliersErrorState,
  SuppliersLoadingSkeleton,
} from '../../features/proveedores/components/SupplierListStates'
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
}

export function SuppliersPage() {
  const { hasAnyRole } = useAuth()
  const canWrite = hasAnyRole([...SUPPLIER_WRITE_ROLES])

  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState<EstadoFiltro>('activos')
  const [page, setPage] = useState(1)

  const [editing, setEditing] = useState<Supplier | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [toDeactivate, setToDeactivate] = useState<Supplier | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  const { data, isLoading, isError, refetch } = useSuppliers({
    search: search || undefined,
    isActive: estado === 'activos',
    page,
    pageSize: PAGE_SIZE,
  })

  const { create, update, deactivate } = useSupplierMutations()

  function openCreate() {
    setEditing(null)
    setFormError(null)
    setFormOpen(true)
  }

  function openEdit(supplier: Supplier) {
    setEditing(supplier)
    setFormError(null)
    setFormOpen(true)
  }

  async function handleSubmit(input: Parameters<typeof create.mutateAsync>[0]) {
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, input })
      } else {
        await create.mutateAsync(input)
      }
      setFormOpen(false)
    } catch (error) {
      setFormError(toServerErrorMessage(error))
    }
  }

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
        <SearchInput
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Buscar por nombre o teléfono"
          aria-label="Buscar por nombre o teléfono"
        />
        <div role="tablist" aria-label="Filtrar por estado" className="flex gap-2">
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

          {data && data.totalPages > 1 && (
            <Pagination page={data.page} pageCount={data.totalPages} onPageChange={setPage} />
          )}
        </>
      )}

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
  )
}