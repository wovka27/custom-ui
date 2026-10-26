import { describe, expect, it } from 'vitest'
import { indexLetters } from './letters'

describe('indexLetters', () => {
  it('keeps the first letter of each group once', () => {
    expect(
      indexLetters([
        { id: '1', label: 'Ada' },
        { id: '2', label: 'alan' },
        { id: '3', label: 'Grace' },
      ]),
    ).toEqual(['A', 'G'])
  })
})
