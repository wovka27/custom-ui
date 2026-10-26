import { describe, expect, it } from 'vitest'
import { visibleTreeRows, type UiTreeNode } from './tree'

const nodes: readonly UiTreeNode[] = [
  { id: 'a', label: 'A', children: [{ id: 'a1', label: 'A1' }] },
  { id: 'b', label: 'B' },
]

describe('visibleTreeRows', () => {
  it('hides collapsed children', () => {
    expect(visibleTreeRows(nodes, new Set()).map((row) => row.node.id)).toEqual(['a', 'b'])
    expect(visibleTreeRows(nodes, new Set(['a'])).map((row) => row.node.id)).toEqual([
      'a',
      'a1',
      'b',
    ])
  })
})
