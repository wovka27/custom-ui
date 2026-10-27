import { describe, expect, it } from 'vitest'
import { readPublishedVersion } from './version'

describe('published version', () => {
  it('reads a release version', () => {
    expect(readPublishedVersion({ version: '0.2.1' })).toBe('0.2.1')
    expect(readPublishedVersion({ version: '1.0.0-beta.1' })).toBe('1.0.0-beta.1')
  })

  it('rejects a body that is not a release version', () => {
    expect(readPublishedVersion(null)).toBeUndefined()
    expect(readPublishedVersion({})).toBeUndefined()
    expect(readPublishedVersion({ version: 1 })).toBeUndefined()
    expect(readPublishedVersion({ version: 'latest' })).toBeUndefined()
  })
})
