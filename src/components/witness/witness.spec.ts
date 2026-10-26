import { describe, expect, it } from 'vitest'
import { witnessWhen } from './witness'

describe('witnessWhen', () => {
  it('prints the instant in UTC', () => {
    expect(witnessWhen('2026-10-23T04:00:00.000Z')).toBe('2026-10-23 04:00')
  })
})
