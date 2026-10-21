import { describe, expect, it } from 'vitest'
import { calendarDays, parseIso, toIso } from './calendar'

describe('calendar', () => {
  it('rejects impossible dates and keeps real ones', () => {
    expect(parseIso('2026-02-31')).toBeNull()
    expect(parseIso('2026-12-31')).not.toBeNull()
    const date = parseIso('2026-12-31')
    expect(date ? toIso(date) : '').toBe('2026-12-31')
  })

  it('starts a Monday grid on the leading Monday', () => {
    const days = calendarDays(2026, 0, 1)
    expect(days).toHaveLength(42)
    expect(days[0]?.iso).toBe('2025-12-29')
    expect(days.find((day) => day.iso === '2026-01-01')?.outside).toBe(false)
  })
})
