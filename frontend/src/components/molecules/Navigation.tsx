import { Link } from 'react-router-dom'

export type BreadcrumbItem = { label: string; href?: string }
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Migas de pan">
      <ol className="breadcrumbs">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href ? (
              <Link to={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  return (
    <nav className="pagination" aria-label="Paginación">
      <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Anterior
      </button>
      <span aria-live="polite">
        Página {page} de {pageCount}
      </span>
      <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>
        Siguiente
      </button>
    </nav>
  )
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="stepper">
      {steps.map((step, index) => (
        <li
          key={step}
          aria-current={index === current ? 'step' : undefined}
          data-state={index < current ? 'complete' : index === current ? 'current' : 'upcoming'}
        >
          {step}
        </li>
      ))}
    </ol>
  )
}
