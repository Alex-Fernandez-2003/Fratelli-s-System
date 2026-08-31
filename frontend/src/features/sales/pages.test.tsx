import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ShortageDialog } from './pages'

describe('HU-012/HU-013 shortage dialog', () => {
  it('renders every positive server shortage and does not continue on return or while pending', () => {
    const onClose = vi.fn()
    const onContinue = vi.fn()
    const { rerender } = render(
      <ShortageDialog
        shortages={[
          { productName: 'Masa', shortageQuantity: 2, inventoryUnitSymbol: 'kg' },
          { productName: 'Salsa', shortageQuantity: -4, inventoryUnitSymbol: 'l' },
        ]}
        pending={false}
        onClose={onClose}
        onContinue={onContinue}
      />,
    )
    expect(screen.getByRole('dialog', { name: 'Stock insuficiente' })).toHaveTextContent(
      'Masa: Faltante 2 kg',
    )
    expect(screen.getByRole('dialog')).toHaveTextContent('Salsa: Faltante 0 l')
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(onContinue).not.toHaveBeenCalled()
    rerender(<ShortageDialog shortages={[]} pending onClose={onClose} onContinue={onContinue} />)
    expect(screen.getByRole('button', { name: 'Volver' })).toBeDisabled()
  })
})
