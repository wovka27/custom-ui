import { describe, expect, it } from 'vitest'
import { tokenOverrides } from './token-override'
import { compileScore, ledgerScore, parseScore } from './score'
import type { DesignScore } from './score'

const openScore: DesignScore = {
  name: 'Open',
  hue: 190,
  chroma: 0.14,
  ground: 'void',
  shape: 'round',
  density: 'open',
  motion: 'measured',
  elevation: 'lift',
  voice: 'plain',
}

function hueOf(value: string | undefined): number {
  const match = /oklch\([0-9.]+ [0-9.]+ (\d+)/.exec(value ?? '')
  const hue = match?.[1]
  if (hue === undefined) throw new Error(`No hue in ${value ?? ''}`)
  return Number(hue)
}

const visualNames = tokenOverrides.tokens
  .filter((token) => {
    const branch = token.path[0]
    if (branch === 'foundation') {
      return (
        token.name !== '--ui-z-dropdown' &&
        token.name !== '--ui-z-overlay' &&
        token.name !== '--ui-z-dialog' &&
        token.name !== '--ui-content-width' &&
        token.name !== '--ui-sidebar-width' &&
        token.name !== '--ui-container-width' &&
        token.name !== '--ui-grid-min'
      )
    }
    return (
      token.name === '--ui-button-radius' ||
      token.name === '--ui-control-radius' ||
      token.name === '--ui-control-height-sm' ||
      token.name === '--ui-control-height-md' ||
      token.name === '--ui-control-height-lg' ||
      token.name === '--ui-table-radius'
    )
  })
  .map((token) => token.name)

describe('design score', () => {
  it('rejects a score that does not name every axis', () => {
    const rest: Record<string, unknown> = { ...ledgerScore }
    delete rest.hue
    expect(() => parseScore(rest)).toThrow(/hue/)
    expect(() => parseScore({ ...ledgerScore, ground: 'stone' })).toThrow(/ground/)
    expect(() => parseScore({ ...ledgerScore, chroma: 0.5 })).toThrow(/chroma/)
  })

  it('compiles one score into both themes and the shared grammar', () => {
    const ledger = compileScore(ledgerScore)
    const signal = compileScore(openScore)
    expect(ledger.shared['--ui-button-radius']).toBe('0px')
    expect(ledger.shared['--ui-radius-lg']).toBe('0px')
    expect(ledger.shared['--ui-font-sans']).toContain('Cascadia Mono')
    expect(ledger.shared['--ui-duration']).toBe('0ms')
    expect(ledger.light['--ui-shadow-pop']).toBe('none')
    expect(signal.shared['--ui-button-radius']).toBe('999px')
    expect(signal.shared['--ui-duration']).toBe('280ms')
    expect(signal.light['--ui-shadow-pop']).not.toBe('none')
    expect(signal.dark['--ui-color-bg']).not.toBe(signal.light['--ui-color-bg'])
    expect(hueOf(signal.light['--ui-color-accent'])).toBe(190)
    expect(
      Math.abs(hueOf(signal.light['--ui-color-accent']) - hueOf(signal.light['--ui-color-danger'])),
    ).toBeGreaterThan(40)
  })

  it('covers the visual tokens and leaves layout metrics alone', () => {
    const compiled = compileScore(openScore)
    const painted = { ...compiled.shared, ...compiled.light, ...compiled.dark }
    for (const name of visualNames) {
      expect(painted[name]?.length).toBeGreaterThan(0)
    }
    expect(painted['--ui-z-dropdown']).toBeUndefined()
    expect(painted['--ui-content-width']).toBeUndefined()
    expect(Object.values(painted).some((value) => value.includes(';'))).toBe(false)
  })
})
