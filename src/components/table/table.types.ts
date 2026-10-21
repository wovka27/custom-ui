export type UiSortDirection = 'asc' | 'desc'

export interface UiSortState {
  columnId: string
  direction: UiSortDirection
}

export interface UiColumn<T extends object> {
  id: string
  header: string
  cell?: (row: T) => string | number
  children?: readonly UiColumn<T>[]
  sortable?: boolean
  sortValue?: (row: T) => string | number
  align?: 'start' | 'center' | 'end'
  width?: string
  minWidth?: string
}
