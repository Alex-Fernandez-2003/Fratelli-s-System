import type { ReactNode } from 'react'
export function AuthLayout({
  children,
  title,
  description,
  branding,
  illustration,
  integrated = false,
}: {
  children: ReactNode
  title: string
  description?: string
  branding?: ReactNode
  illustration?: ReactNode
  integrated?: boolean
}) {
  return (
    <main
      data-layout={integrated ? 'integrated' : 'panel'}
      className={`grid min-h-screen place-items-center bg-[#151617] p-5 ${illustration ? 'md:grid-cols-[minmax(0,28rem)_minmax(0,28rem)] md:gap-8' : ''}`}
    >
      {illustration && <aside className="max-w-md text-text-muted">{illustration}</aside>}
      <section
        className={`w-full ${integrated ? 'max-w-md' : 'max-w-[24.5rem] rounded-xl border border-[#36383b] bg-surface p-7 shadow-[0_1.25rem_3rem_rgb(0_0_0_/_28%)]'} max-[480px]:border-0 max-[480px]:bg-transparent max-[480px]:p-0 max-[480px]:shadow-none`}
      >
        {branding && <div className="mb-5 max-[480px]:mb-10">{branding}</div>}
        <h1 className="mb-1.5 text-[1.65rem] tracking-tight">{title}</h1>
        {description && (
          <p className="mb-6 text-[0.92rem] leading-6 text-text-muted">{description}</p>
        )}
        {children}
      </section>
    </main>
  )
}
