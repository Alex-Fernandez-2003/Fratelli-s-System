import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Action'

describe('Button', () => {
  it('keeps compact actions at a touch-friendly minimum height', () => {
    render(<Button size="sm">Siguiente</Button>)

    expect(screen.getByRole('button', { name: 'Siguiente' })).toHaveClass('min-h-10')
  })
})
