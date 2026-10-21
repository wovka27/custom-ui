import type { UiColumn } from '@/components/table'

export interface DataColumn<T extends object> {
  id: string
  header: string
  field?: keyof T & string
  value?: (row: T) => string | number
  children?: readonly DataColumn<T>[]
  sortable?: boolean
  align?: 'start' | 'center' | 'end'
  width?: string
  minWidth?: string
}

export interface DataTableSchema<T extends object> {
  caption: string
  columns: readonly DataColumn<T>[]
  rowKey: (keyof T & string) | ((row: T) => string)
  selectable?: boolean
  zebra?: boolean
  density?: 'compact' | 'comfortable'
  layout?: 'auto' | 'fixed'
  pageSizes?: readonly number[]
  emptyTitle?: string
  emptyDescription?: string
}

export function defineTable<T extends object>(schema: DataTableSchema<T>): DataTableSchema<T> {
  return schema
}

export function column<T extends object>(definition: DataColumn<T>): DataColumn<T> {
  return definition
}

export function readField<T extends object>(row: T, field: keyof T & string): string | number {
  const value: unknown = row[field]
  if (typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return ''
}

export function columnsFrom<T extends object>(nodes: readonly DataColumn<T>[]): UiColumn<T>[] {
  return nodes.map((node) => {
    const field = node.field
    const display = node.value ?? (field ? (row: T) => readField(row, field) : undefined)
    const sortRead = field ? (row: T) => readField(row, field) : display
    const children = node.children ? columnsFrom(node.children) : undefined
    return {
      id: node.id,
      header: node.header,
      align: node.align,
      width: node.width,
      minWidth: node.minWidth,
      sortable: node.sortable,
      sortValue: node.sortable ? sortRead : undefined,
      cell: display,
      children,
    }
  })
}

export function rowKeyOf<T extends object>(
  row: T,
  rowKey: DataTableSchema<T>['rowKey'],
): string {
  if (typeof rowKey === 'function') return rowKey(row)
  const value: unknown = row[rowKey]
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}
