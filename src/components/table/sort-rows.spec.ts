import { describe, expect, it } from 'vitest'
import type { UiColumn } from './table.types'
import { sortRows } from './sort-rows'

interface Sample {
  name: string
  total: number
}

const rows: Sample[] = [
  { name: 'Cedar', total: 20 },
  { name: 'Alder', total: 3 },
  { name: 'Birch', total: 11 },
]

const nameColumn: UiColumn<Sample> = {
  id: 'name',
  header: 'Name',
  sortable: true,
  cell: (row) => row.name,
}

const totalColumn: UiColumn<Sample> = {
  id: 'total',
  header: 'Total',
  sortable: true,
  cell: (row) => row.total,
}

describe('sortRows', () => {
  it('returns a copy when nothing is sorted', () => {
    const result = sortRows(rows, undefined, undefined)
    expect(result).toEqual(rows)
    expect(result).not.toBe(rows)
  })

  it('sorts numbers and strings without mutating the source', () => {
    expect(sortRows(rows, totalColumn, 'asc').map((row) => row.total)).toEqual([3, 11, 20])
    expect(sortRows(rows, nameColumn, 'desc').map((row) => row.name)).toEqual([
      'Cedar',
      'Birch',
      'Alder',
    ])
    expect(rows.map((row) => row.name)).toEqual(['Cedar', 'Alder', 'Birch'])
  })
})
