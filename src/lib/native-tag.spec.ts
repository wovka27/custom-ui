import { describe, expect, it } from 'vitest'
import { nativeRole, nativeTag } from './native-tag'

describe('nativeTag', () => {
  it('keeps real elements and does not resolve search as a component', () => {
    expect(nativeTag('section')).toBe('section')
    expect(nativeTag('search')).toBe('div')
    expect(nativeRole('search')).toBe('search')
    expect(nativeTag('missing-widget')).toBe('div')
    expect(nativeRole('section')).toBeUndefined()
  })
})