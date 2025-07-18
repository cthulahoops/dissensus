import { describe, it, expect } from 'vitest'
import { formatHoursMinutes } from './sleepUtils'

describe('formatHoursMinutes', () => {
  it('should format exact hours correctly', () => {
    expect(formatHoursMinutes(7.0)).toBe('7:00')
    expect(formatHoursMinutes(1.0)).toBe('1:00')
    expect(formatHoursMinutes(0.0)).toBe('0:00')
  })

  it('should format fractional hours correctly', () => {
    expect(formatHoursMinutes(6.5)).toBe('6:30')
    expect(formatHoursMinutes(7.25)).toBe('7:15')
    expect(formatHoursMinutes(8.75)).toBe('8:45')
  })

  it('should handle the specific bug case (6.999... should round properly, not become 6:60)', () => {
    expect(formatHoursMinutes(6.999)).toBe('7:00') // 6.999 * 60 = 419.94 minutes, rounds to 420 = 7:00
    expect(formatHoursMinutes(6.9999)).toBe('7:00') // 6.9999 * 60 = 419.994 minutes, rounds to 420 = 7:00
    expect(formatHoursMinutes(6.99999)).toBe('7:00') // 6.99999 * 60 = 419.9994 minutes, rounds to 420 = 7:00
  })

  it('should handle null and NaN inputs', () => {
    expect(formatHoursMinutes(null)).toBe('N/A')
    expect(formatHoursMinutes(NaN)).toBe('N/A')
  })

  it('should pad single-digit minutes with zero', () => {
    expect(formatHoursMinutes(7.1)).toBe('7:06')
    expect(formatHoursMinutes(5.033)).toBe('5:02')
  })

  it('should handle edge cases around minute boundaries', () => {
    expect(formatHoursMinutes(7.016)).toBe('7:01') // 7.016 hours = 7:00.96 minutes, rounds to 7:01
    expect(formatHoursMinutes(7.983)).toBe('7:59') // 7.983 hours = 7:58.98 minutes, rounds to 7:59
  })
})