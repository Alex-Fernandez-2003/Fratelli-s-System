import { describe, expect, it, vi } from 'vitest'
import { BUSINESS_LOCATION_LABEL, BUSINESS_TIME_ZONE, formatBusinessTime } from './business-time'

describe('business time', () => {
  it('formats presentation time in Tarija operational timezone', () => {
    const formatter = { format: vi.fn(() => '14:32:05') }
    const dateTimeFormat = vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function () {
      return formatter as unknown as Intl.DateTimeFormat
    })

    expect(formatBusinessTime(true)).toBe('14:32:05')
    expect(dateTimeFormat).toHaveBeenCalledWith(
      'es-BO',
      expect.objectContaining({ timeZone: 'America/La_Paz', second: '2-digit' }),
    )
    expect(BUSINESS_TIME_ZONE).toBe('America/La_Paz')
    expect(BUSINESS_LOCATION_LABEL).toBe('Tarija, Bolivia')

    dateTimeFormat.mockRestore()
  })
})
