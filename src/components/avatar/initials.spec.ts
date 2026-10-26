import { describe, expect, it } from 'vitest'
import { initials } from './initials'

describe('initials', () => {
  it('uses the first and last word', () => {
    expect(initials('Ada Lovelace')).toBe('AL')
    expect(initials('  ada   ')).toBe('A')
    expect(initials('')).toBe('')
  })
})
