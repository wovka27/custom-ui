import type { UiColumn, UiSortDirection } from './table.types'

function compareValues(left: string | number, right: string | number): number {
  if (typeof left === 'number' && typeof right === 'number') return left - right
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

export function sortRows<T extends object>(
  rows: readonly T[],
  column: UiColumn<T> | undefined,
  direction: UiSortDirection | undefined,
): T[] {
  if (!column?.sortable || !direction) return [...rows]
  const read = column.sortValue ?? column.cell
  if (!read) return [...rows]
  const factor = direction === 'asc' ? 1 : -1
  return [...rows].sort((left, right) => factor * compareValues(read(left), read(right)))
}
