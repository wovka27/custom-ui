import { describe, expect, it } from 'vitest'
import { column, columnsFrom, defineTable, rowKeyOf } from './schema'

interface Invoice {
  id: string
  total: number
}

const schema = defineTable<Invoice>({
  caption: 'Invoices',
  rowKey: 'id',
  columns: [
    column({
      id: 'money',
      header: 'Money',
      children: [
        column({
          id: 'total',
          header: 'Total',
          field: 'total',
          sortable: true,
          value: (row) => `$${row.total}`,
        }),
      ],
    }),
  ],
})

describe('defineTable', () => {
  it('keeps display text and sorts by the raw field', () => {
    const [group] = columnsFrom(schema.columns)
    const leaf = group?.children?.[0]
    const row = { id: 'inv-1', total: 40 }
    expect(leaf?.cell?.(row)).toBe('$40')
    expect(leaf?.sortValue?.(row)).toBe(40)
    expect(rowKeyOf(row, schema.rowKey)).toBe('inv-1')
  })
})
