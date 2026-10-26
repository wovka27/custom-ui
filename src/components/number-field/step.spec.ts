import { describe, expect, it } from 'vitest'
import { nextStep } from './step'

describe('nextStep', () => {
  it('clamps to the declared range', () => {
    expect(nextStep(2, 1, 1, 0, 3)).toBe(3)
    expect(nextStep(0, -1, 1, 0, 3)).toBe(0)
    expect(nextStep(Number.NaN, 1, 0.5, 0, 2)).toBe(0.5)
  })
})
