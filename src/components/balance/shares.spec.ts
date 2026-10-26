import { describe, expect, it } from 'vitest'
import { shares } from './shares'

describe('shares', () => {
  it('splits a total and keeps an empty pair even', () => {
    expect(shares(1, 3)).toEqual({ start: 25, end: 75 })
    expect(shares(0, 0)).toEqual({ start: 50, end: 50 })
    expect(shares(-2, 2).start).toBe(0)
  })
})
