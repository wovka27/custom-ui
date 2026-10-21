import { describe, expect, it } from 'vitest'
import { resolveAllOption, withAllOption } from './select-all'

describe('resolveAllOption', () => {
  it('defaults the first option to All / null and accepts a custom value', () => {
    expect(resolveAllOption(true)).toEqual({ label: 'All', value: null })
    expect(resolveAllOption({ label: 'Any status', value: 'any' })).toEqual({
      label: 'Any status',
      value: 'any',
    })
    expect(resolveAllOption({ value: null })).toEqual({ label: 'All', value: null })
    expect(resolveAllOption(undefined)).toBeNull()
  })
})

describe('withAllOption', () => {
  it('prepends All and skips a custom value that already exists', () => {
    const options = [{ value: 'paid', label: 'Paid' }] as const
    expect(withAllOption(options, true)[0]).toEqual({ label: 'All', value: null })
    expect(withAllOption(options, { value: 'paid', label: 'All' })).toEqual([
      { value: 'paid', label: 'Paid' },
    ])
  })
})
