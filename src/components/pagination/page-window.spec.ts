import { describe, expect, it } from 'vitest'
import { pageWindow } from './page-window'

describe('pageWindow', () => {
  it('follows the compact 1 … 3, 4 spread', () => {
    expect(pageWindow(4, 10)).toEqual([1, 'gap', 3, 4])
    expect(pageWindow(1, 10)).toEqual([1, 2])
    expect(pageWindow(2, 10)).toEqual([1, 2])
    expect(pageWindow(3, 10)).toEqual([1, 2, 3])
    expect(pageWindow(10, 10)).toEqual([1, 'gap', 9, 10])
  })

  it('collapses a single page and an empty count', () => {
    expect(pageWindow(1, 1)).toEqual([1])
    expect(pageWindow(3, 0)).toEqual([])
  })
})
