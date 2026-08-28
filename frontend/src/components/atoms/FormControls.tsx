import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
const control =
  'w-full rounded-md border border-border bg-surface px-2.5 py-2.5 text-text placeholder:text-text-muted focus:outline-2 focus:outline-offset-2 focus:outline-brand-orange disabled:cursor-not-allowed disabled:opacity-60'
export const Input = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${control} ${className}`} />
)
export const Textarea = ({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`${control} ${className}`} />
)
export const Select = ({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`${control} ${className}`}>
    {children}
  </select>
)
export const Checkbox = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`accent-brand-orange ${className}`} type="checkbox" />
)
export const Radio = ({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`accent-brand-orange ${className}`} type="radio" />
)
