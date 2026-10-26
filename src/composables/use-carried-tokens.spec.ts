import { describe, expect, it } from 'vitest'
import { readCarriedTokens } from './use-carried-tokens'

describe('carried tokens', () => {
  it('keeps set ui variables and drops empty ones', () => {
    const values = new Map<string, string>([
      ['--ui-color-bg', ' oklch(0.100 0.017 190) '],
      ['--ui-button-radius', '999px'],
      ['--ui-z-dialog', ''],
    ])
    const style = {
      getPropertyValue: (name: string) => values.get(name) ?? '',
    }
    expect(readCarriedTokens(style)).toMatchObject({
      '--ui-color-bg': 'oklch(0.100 0.017 190)',
      '--ui-button-radius': '999px',
    })
    expect(readCarriedTokens(style)['--ui-z-dialog']).toBeUndefined()
  })
})
