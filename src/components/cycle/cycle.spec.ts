import { describe, expect, it } from 'vitest'
import { nextCycle } from './cycle'

const states = [
  { id: 'draft', label: 'Draft' },
  { id: 'review', label: 'Review' },
  { id: 'filed', label: 'Filed' },
]

describe('nextCycle', () => {
  it('wraps in both directions', () => {
    expect(nextCycle(states, 'filed', 1)).toBe('draft')
    expect(nextCycle(states, 'draft', -1)).toBe('filed')
  })
})
