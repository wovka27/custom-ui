import { describe, expect, it } from 'vitest'
import { maskSecret } from './mask'

describe('maskSecret', () => {
  it('hides letters and digits and keeps the gaps', () => {
    expect(maskSecret('GB29 NWBK')).toBe('•••• ••••')
  })
})
