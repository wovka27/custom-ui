import { describe, expect, it } from 'vitest'
import { tokenOverrides, type TokenTreeNode } from './token-override'

function listedNames(nodes: readonly TokenTreeNode[], into: string[] = []): string[] {
  for (const node of nodes) {
    into.push(...node.tokens)
    listedNames(node.children, into)
  }
  return into
}

describe('token override contract', () => {
  it('lists every token once in the tree', () => {
    const listed = listedNames(tokenOverrides.tree)
    const unique = new Set(listed)
    expect(unique.size).toBe(listed.length)
    expect(unique).toEqual(new Set(tokenOverrides.tokens.map((token) => token.name)))
  })

  it('keeps proposals empty and names on the ui prefix', () => {
    expect(tokenOverrides.tokens.length).toBeGreaterThan(0)
    for (const token of tokenOverrides.tokens) {
      expect(token.name.startsWith('--ui-')).toBe(true)
      expect(token.proposal).toBeNull()
      expect(token.reads.every((name) => name.startsWith('--ui-'))).toBe(true)
    }
  })

  it('gives theme tokens both themes and hooks a fallback', () => {
    for (const token of tokenOverrides.tokens) {
      if (token.themes !== null) {
        expect(token.themes.light.length).toBeGreaterThan(0)
        expect(token.themes.dark.length).toBeGreaterThan(0)
        expect(token.value).toBeNull()
      }
      if (!token.declared) {
        const hasFallback = token.fallback !== null || token.fallbackByVariant !== null
        expect(hasFallback).toBe(true)
      }
    }
  })
})
