import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { catalog, componentCount } from './catalog'
import { componentDocs } from './docs'

function exportedComponents(): Set<string> {
  const source = readFileSync(join(process.cwd(), 'src/index.ts'), 'utf8')
  const names = new Set<string>()
  for (const line of source.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('export type') || trimmed.startsWith('import ')) continue
    for (const match of trimmed.matchAll(/\b(Ui[A-Z][A-Za-z0-9]*)\b/g)) {
      const name = match[1]
      if (name) names.add(name)
    }
  }
  return names
}

function exampleSource(): string {
  const dir = join(process.cwd(), 'src/site/examples')
  return readdirSync(dir)
    .filter((file) => file.endsWith('.vue') && file !== 'Demo.vue')
    .map((file) => readFileSync(join(dir, file), 'utf8'))
    .join('\n')
}

describe('catalog', () => {
  it('names every exported component once', () => {
    const listed = catalog.flatMap((group) => group.names)
    expect(new Set(listed).size).toBe(listed.length)
    expect(listed).toHaveLength(componentCount)
    expect(new Set(listed)).toEqual(exportedComponents())
  })

  it('gives every component a page and an example', () => {
    const listed = catalog.flatMap((group) => group.names)
    const examples = exampleSource()
    for (const name of listed) {
      expect(componentDocs[name]?.summary.length).toBeGreaterThan(0)
      expect(examples).toContain(`'${name}'`)
    }
  })
})
