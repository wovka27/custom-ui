import { describe, expect, it } from 'vitest'
import { sparkPoints } from './points'

describe('sparkPoints', () => {
  it('draws a rising line and ignores an empty series', () => {
    const points = sparkPoints([0, 10], 10, 10).split(' ')
    expect(points).toHaveLength(2)
    expect(points[0]?.startsWith('0.00,')).toBe(true)
    expect(points[1]?.startsWith('10.00,')).toBe(true)
    expect(sparkPoints([], 10, 10)).toBe('')
  })
})
