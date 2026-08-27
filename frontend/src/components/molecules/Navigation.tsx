import { Link, useLocation } from 'react-router-dom'
export type BreadcrumbItem = { label: string; href?: string }
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Migas de pan">
      <ol className="flex list-none flex-wrap gap-2 p-0">
        {items.map((item, index) => (
          <li
            className="flex items-center gap-2 after:content-['/'] last:after:content-none"
            key={`${item.label}-${index}`}
          >
            {item.href ? (
              <Link
                className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange"
                to={item.href}
              >
                {item.label}
              </Link>
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
  const button =
    'rounded-md bg-brand-orange px-3.5 py-2.5 font-bold text-brand-black hover:bg-brand-orange-hover disabled:cursor-not-allowed disabled:opacity-60'
  return (
    <nav className="my-4 flex items-center gap-3" aria-label="Paginación">
      <button
        className={button}
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Anterior
      </button>
      <span aria-live="polite">
        Página {page} de {pageCount}
      </span>
      <button
        className={button}
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
      >
        Siguiente
      </button>
    </nav>
  )
}
export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex list-none flex-wrap gap-2 p-0">
      {steps.map((step, index) => (
        <li
          className={`border-b-2 p-2 ${index < current ? 'border-success' : index === current ? 'border-brand-orange' : 'border-border'}`}
          key={step}
          aria-current={index === current ? 'step' : undefined}
        >
          {step}
        </li>
      ))}
    </ol>
  )
}

export type PrimaryNavItem = { label: string; href: string }
export function PrimaryNav({ items }: { items: PrimaryNavItem[] }) {
  const location = useLocation()
  return (
    <ul className="flex list-none flex-wrap gap-4 p-0">
      {items.map((item) => {
        const isActive = location.pathname === item.href
        return (
          <li key={item.href}>
            <Link
              to={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`font-bold no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${isActive ? 'text-brand-orange' : 'text-text-muted'}`}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}