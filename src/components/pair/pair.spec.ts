import { describe, expect, it } from 'vitest'
import { orderPair, swapPair } from './pair'

describe('pair', () => {
  it('orders the ends and swaps them', () => {
    expect(orderPair(8, 2)).toEqual({ start: 2, end: 8 })
    expect(swapPair({ start: 2, end: 8 })).toEqual({ start: 8, end: 2 })
  })
})
