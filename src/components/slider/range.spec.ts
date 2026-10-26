import { describe, expect, it } from 'vitest'
import { slideRange } from './range'

describe('slideRange', () => {
  it('keeps a thumb on its own side until it meets the other', () => {
    expect(slideRange('low', 40, 24, 70)).toEqual({ edge: 'low', value: [40, 70] })
    expect(slideRange('high', 80, 24, 70)).toEqual({ edge: 'high', value: [24, 80] })
    expect(slideRange('low', 70, 24, 70)).toEqual({ edge: 'low', value: [70, 70] })
    expect(slideRange('high', 24, 24, 70)).toEqual({ edge: 'high', value: [24, 24] })
  })

  it('lets the dragged thumb pass through and keeps that thumb moving', () => {
    expect(slideRange('low', 82, 24, 70)).toEqual({ edge: 'high', value: [70, 82] })
    expect(slideRange('high', 10, 24, 70)).toEqual({ edge: 'low', value: [10, 24] })
    expect(slideRange('low', 71, 70, 70)).toEqual({ edge: 'high', value: [70, 71] })
    expect(slideRange('high', 69, 70, 70)).toEqual({ edge: 'low', value: [69, 70] })
  })
})