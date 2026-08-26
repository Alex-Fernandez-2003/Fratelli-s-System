import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ElapsedTime } from './ElapsedTime'
describe('ElapsedTime', () => {
  afterEach(() => vi.useRealTimers())
  it('derives elapsed display from Date.now', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    render(<ElapsedTime origin="2025-12-31T23:59:00Z" />)
    expect(screen.getByText('1:00')).toBeTruthy()
    act(() => vi.advanceTimersByTime(1000))
    expect(screen.getByText('1:01')).toBeTruthy()
  })
})
