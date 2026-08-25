import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PasswordInput } from './FormFields'

describe('PasswordInput authentication behavior', () => {
  it('reveals and hides the entered password with changing accessible names', () => {
    render(<PasswordInput aria-label="Contraseña" />)
    const input = screen.getByLabelText('Contraseña')
    fireEvent.change(input, { target: { value: 'Secreta!123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveValue('Secreta!123')
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))
    expect(input).toHaveAttribute('type', 'password')
  })
})
