import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Spinner } from '../atoms'
import { EmptyState } from '../molecules'

export type DataTableColumn<T> = {
  id: string
  header: ReactNode
  cell: (row: T) => ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isLoading = false,
  error,
  emptyMessage = 'No se encontraron resultados.',
  actions,
}: {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  error?: ReactNode
  emptyMessage?: string
  actions?: (row: T) => ReactNode
}) {
  if (isLoading) return <Spinner label="Cargando tabla" />
  if (error) return <div role="alert">{error}</div>
  if (!rows.length) return <EmptyState>{emptyMessage}</EmptyState>
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} scope="col">
                {column.header}
              </th>
            ))}
            {actions && <th scope="col">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowId(row)}>
              {columns.map((column) => (
                <td key={column.id}>{column.cell(row)}</td>
              ))}
              {actions && <td>{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])
  if (!open) return null
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') onClose()
        }}
      >
        <header className="modal__header">
          <h2 id="modal-title">{title}</h2>
          <button
            ref={closeRef}
            type="button"
            className="button button--ghost button--sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </header>
  )
}
