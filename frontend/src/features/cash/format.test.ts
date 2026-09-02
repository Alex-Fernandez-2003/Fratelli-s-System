import { describe, expect, it } from 'vitest'
import {
  differenceLabel,
  differenceSemantic,
  formatBusinessDateLong,
  formatSignedMoney,
} from './format'

describe('cash history presentation', () => {
  it.each([
    [12, 'Sobrante'],
    [-12, 'Faltante'],
    [0, 'Cuadrado'],
  ])('uses textual difference semantics for %s', (value, label) => {
    expect(differenceSemantic(value)).toBe(label)
    expect(differenceLabel(value)).toContain(label === 'Cuadrado' ? 'cuadrada' : label)
  })

  it('preserves the numeric sign in the history amount', () => {
    expect(formatSignedMoney(12)).toMatch(/^\+/)
    expect(formatSignedMoney(-12)).toMatch(/-/)
    expect(formatSignedMoney(0)).not.toMatch(/[+-]/)
  })

  it('treats a BusinessDate as a calendar date rather than shifting it through UTC midnight', () => {
    expect(formatBusinessDateLong('2026-02-01')).toMatch(/1/)
    expect(formatBusinessDateLong('2026-02-28')).toMatch(/28/)
  })
})
