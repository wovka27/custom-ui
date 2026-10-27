import { describe, expect, it } from 'vitest'
import { tokenOverrides } from '@/styles/token-override'
import { figmaPrompt, figmaStylesheet, themeImport } from './theme-file'

const names = tokenOverrides.tokens.map((token) => token.name)

function mentioned(source: string): string[] {
  return [...source.matchAll(/--ui-[a-z0-9-]+/g)].map((match) => match[0] ?? '')
}

describe('theme file templates', () => {
  it('names only real variables', () => {
    const known = new Set(names)
    for (const source of [figmaPrompt, figmaStylesheet]) {
      for (const name of mentioned(source)) expect(known.has(name)).toBe(true)
    }
  })

  it('lists every variable in the prompt contract once', () => {
    const contract = figmaPrompt.split('CONTRACT\n')[1] ?? ''
    for (const name of names) {
      const lines = contract.split('\n').filter((line) => line.startsWith(`${name} |`))
      expect(lines).toHaveLength(1)
    }
    expect(figmaPrompt.trimEnd().endsWith('FIGMA')).toBe(true)
  })

  it('puts theme colors in the light block and both dark blocks', () => {
    const themed = tokenOverrides.tokens.filter((token) => token.themes !== null)
    expect(themed.length).toBeGreaterThan(0)
    for (const token of themed) {
      const lines = figmaStylesheet.split('\n').filter((line) => line.includes(`/* ${token.name}:`))
      expect(lines).toHaveLength(3)
    }
    expect(figmaStylesheet).toContain(":root,\n[data-theme='light']")
    expect(figmaStylesheet).toContain("[data-theme='dark']")
    expect(figmaStylesheet).toContain(":root:not([data-theme='light'])")
    expect(figmaStylesheet).toContain(themeImport)
  })

  it('lists a shared variable once', () => {
    const shared = tokenOverrides.tokens.find((token) => token.name === '--ui-space-1')
    expect(shared).toBeDefined()
    const lines = figmaStylesheet.split('\n').filter((line) => line.includes('/* --ui-space-1:'))
    expect(lines).toHaveLength(1)
  })
})
