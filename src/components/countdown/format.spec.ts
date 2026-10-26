import { describe, expect, it } from 'vitest'
import { formatRemaining } from './format'

describe('formatRemaining', () => {
  it('formats a clock and keeps past time at zero', () => {
    expect(formatRemaining(65_000)).toBe('00:01:05')
    expect(formatRemaining(86_400_000)).toBe('1d 00:00:00')
    expect(formatRemaining(-10)).toBe('00:00:00')
  })
})
