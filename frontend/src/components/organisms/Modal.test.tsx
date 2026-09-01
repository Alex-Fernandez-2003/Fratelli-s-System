import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Modal } from './index'

function ModalHarness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir detalle
      </button>
      <Modal open={open} title="Detalle accesible" onClose={() => setOpen(false)}>
        <button type="button">Acción secundaria</button>
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('keeps Tab focus inside and returns focus to its trigger when closed', () => {
    render(<ModalHarness />)
    const trigger = screen.getByRole('button', { name: 'Abrir detalle' })
    trigger.focus()
    fireEvent.click(trigger)

    const dialog = screen.getByRole('dialog', { name: 'Detalle accesible' })
    const close = screen.getByRole('button', { name: 'Cerrar' })
    const action = screen.getByRole('button', { name: 'Acción secundaria' })
    expect(close).toHaveFocus()

    fireEvent.keyDown(dialog, { key: 'Tab', shiftKey: true })
    expect(action).toHaveFocus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(close).toHaveFocus()

    fireEvent.click(close)
    expect(trigger).toHaveFocus()
  })
})
