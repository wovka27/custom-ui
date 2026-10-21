import { describe, expect, it } from 'vitest'
import { hexToHsv, hsvToHex, normalizeHex } from './color'

describe('color', () => {
  it('normalizes short and long hex', () => {
    expect(normalizeHex('fff')).toBe('#ffffff')
    expect(normalizeHex('#0AF')).toBe('#00aaff')
    expect(normalizeHex('nope')).toBeNull()
  })

  it('round-trips primary colors', () => {
    for (const hex of ['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000']) {
      const hsv = hexToHsv(hex)
      expect(hsv).not.toBeNull()
      if (hsv) expect(hsvToHex(hsv)).toBe(hex)
    }
  })
})
