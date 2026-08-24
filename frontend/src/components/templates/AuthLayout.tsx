import type { ReactNode } from 'react'

export function AuthLayout({
  children,
  title,
  description,
  branding,
  illustration,
}: {
  children: ReactNode
  title: string
  description?: string
  /** Neutral content rendered above the authentication heading. */
  branding?: ReactNode
  /** Decorative or explanatory content rendered beside the panel when supplied. */
  illustration?: ReactNode
}) {
  return (
    <main className={`auth-layout ${illustration ? 'auth-layout--with-illustration' : ''}`}>
      {illustration && <aside className="auth-layout__illustration">{illustration}</aside>}
      <section className="auth-layout__panel">
        {branding && <div className="auth-layout__branding">{branding}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </section>
    </main>
  )
}
