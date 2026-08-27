import type { ReactNode } from 'react'

/** @deprecated AuthenticatedLayout owns the only global application shell. */
export function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
