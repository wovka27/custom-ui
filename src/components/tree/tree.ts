export interface UiTreeNode {
  id: string
  label: string
  disabled?: boolean
  children?: readonly UiTreeNode[]
}

export interface UiTreeRow {
  node: UiTreeNode
  depth: number
}

export function visibleTreeRows(
  nodes: readonly UiTreeNode[],
  expanded: ReadonlySet<string>,
  depth = 0,
): UiTreeRow[] {
  const rows: UiTreeRow[] = []
  for (const node of nodes) {
    rows.push({ node, depth })
    if (node.children && node.children.length > 0 && expanded.has(node.id)) {
      rows.push(...visibleTreeRows(node.children, expanded, depth + 1))
    }
  }
  return rows
}
