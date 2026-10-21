<script setup lang="ts" generic="T extends object">
import { computed, useId, useSlots } from 'vue'
import { UiCheckbox } from '@/components/checkbox'
import { UiEmpty } from '@/components/empty'
import { UiSpinner } from '@/components/spinner'
import { useControllable } from '@/composables/use-controllable'
import type { UiColumn, UiSortState } from './table.types'
import { sortRows } from './sort-rows'

const {
  columns,
  rows,
  rowKey,
  rowLabel,
  caption,
  captionVisuallyHidden = false,
  selectable = false,
  loading = false,
  zebra = false,
  density = 'comfortable',
  layout = 'auto',
  embedded = false,
  sort,
  defaultSort = null,
  selected,
  defaultSelected = [],
  expanded,
  defaultExpanded = [],
} = defineProps<{
  columns: readonly UiColumn<T>[]
  rows: readonly T[]
  rowKey: (row: T) => string
  rowLabel?: (row: T) => string
  caption: string
  captionVisuallyHidden?: boolean
  selectable?: boolean
  loading?: boolean
  zebra?: boolean
  density?: 'compact' | 'comfortable'
  layout?: 'auto' | 'fixed'
  embedded?: boolean
  sort?: UiSortState | null
  defaultSort?: UiSortState | null
  selected?: readonly string[]
  defaultSelected?: readonly string[]
  expanded?: readonly string[]
  defaultExpanded?: readonly string[]
}>()

const emit = defineEmits<{
  'update:sort': [value: UiSortState | null]
  'update:selected': [value: string[]]
  'update:expanded': [value: string[]]
}>()

defineSlots<{
  empty(): unknown
  toolbar(): unknown
  footer(): unknown
  header?(props: { columns: readonly UiColumn<T>[]; leaves: readonly UiColumn<T>[] }): unknown
  detail?(props: { row: T }): unknown
  actions?(props: { row: T }): unknown
  'actions-header'?(): unknown
  expand?(props: { row: T; expanded: boolean }): unknown
  [key: `header-${string}`]: () => unknown
  [key: `cell-${string}`]: (props: { row: T; value: string | number }) => unknown
}>()

const slots = useSlots()
const tableId = useId()

const sortState = useControllable<UiSortState | null>({
  value: () => sort,
  defaultValue: () => defaultSort,
  onChange: (next) => {
    emit('update:sort', next)
  },
})
const selection = useControllable<readonly string[]>({
  value: () => selected,
  defaultValue: () => defaultSelected,
  onChange: (next) => {
    emit('update:selected', [...next])
  },
})
const expansion = useControllable<readonly string[]>({
  value: () => expanded,
  defaultValue: () => defaultExpanded,
  onChange: (next) => {
    emit('update:expanded', [...next])
  },
})

function leavesOf(column: UiColumn<T>): readonly UiColumn<T>[] {
  const children = column.children
  if (!children || children.length === 0) return [column]
  return children.flatMap((child) => leavesOf(child))
}

const leaves = computed(() => columns.flatMap((column) => leavesOf(column)))
const grouped = computed(() => columns.some((column) => (column.children?.length ?? 0) > 0))
const groupLeaves = computed(() =>
  columns.flatMap((column) => ((column.children?.length ?? 0) > 0 ? leavesOf(column) : [])),
)
const hasDetail = computed(() => Boolean(slots.detail))
const hasActions = computed(() => Boolean(slots.actions))
const activeColumn = computed(() =>
  leaves.value.find((column) => column.id === sortState.value.value?.columnId),
)
const visibleRows = computed(() =>
  sortRows(rows, activeColumn.value, sortState.value.value?.direction),
)
const columnCount = computed(
  () =>
    leaves.value.length +
    (selectable ? 1 : 0) +
    (hasDetail.value ? 1 : 0) +
    (hasActions.value ? 1 : 0),
)
const visibleKeys = computed(() => visibleRows.value.map((row) => rowKey(row)))
const allSelected = computed(
  () =>
    visibleKeys.value.length > 0 &&
    visibleKeys.value.every((key) => selection.value.value.includes(key)),
)
const partiallySelected = computed(
  () => !allSelected.value && visibleKeys.value.some((key) => selection.value.value.includes(key)),
)

function labelFor(row: T): string {
  return rowLabel?.(row) ?? rowKey(row)
}

function ariaSort(column: UiColumn<T>): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) return undefined
  const current = sortState.value.value
  if (!current || current.columnId !== column.id) return 'none'
  return current.direction === 'asc' ? 'ascending' : 'descending'
}

function toggleSort(column: UiColumn<T>): void {
  if (!column.sortable) return
  const current = sortState.value.value
  if (!current || current.columnId !== column.id) {
    sortState.setValue({ columnId: column.id, direction: 'asc' })
    return
  }
  if (current.direction === 'asc') {
    sortState.setValue({ columnId: column.id, direction: 'desc' })
    return
  }
  sortState.setValue(null)
}

function toggleAll(checked: boolean): void {
  const next = new Set(selection.value.value)
  for (const key of visibleKeys.value) {
    if (checked) next.add(key)
    else next.delete(key)
  }
  selection.setValue([...next])
}

function toggleRow(row: T, checked: boolean): void {
  const next = new Set(selection.value.value)
  const key = rowKey(row)
  if (checked) next.add(key)
  else next.delete(key)
  selection.setValue([...next])
}

function isSelected(row: T): boolean {
  return selection.value.value.includes(rowKey(row))
}

function columnStyle(column: UiColumn<T>): { width?: string; minWidth?: string } | undefined {
  if (!column.width && !column.minWidth) return undefined
  const style: { width?: string; minWidth?: string } = {}
  if (column.width) style.width = column.width
  if (column.minWidth) style.minWidth = column.minWidth
  return style
}

function isGroup(column: UiColumn<T>): boolean {
  return (column.children?.length ?? 0) > 0
}

function spanOf(column: UiColumn<T>): number | undefined {
  const count = leavesOf(column).length
  return isGroup(column) && count > 1 ? count : undefined
}

function rowSpanOf(column: UiColumn<T>): number | undefined {
  return grouped.value && !isGroup(column) ? 2 : undefined
}

function cellText(column: UiColumn<T>, row: T): string | number {
  return column.cell?.(row) ?? ''
}

function isExpanded(row: T): boolean {
  return expansion.value.value.includes(rowKey(row))
}

function detailId(row: T): string {
  return `${tableId}-detail-${rowKey(row)}`
}

function toggleExpand(row: T): void {
  const key = rowKey(row)
  const next = new Set(expansion.value.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expansion.setValue([...next])
}
</script>

<template>
  <div
    class="ui-table"
    :data-density="density"
    :data-layout="layout"
    :data-embedded="embedded || undefined"
    :data-zebra="zebra || undefined"
    :data-grouped="grouped || undefined"
    :aria-busy="loading || undefined"
  >
    <div v-if="$slots.toolbar" class="ui-table__toolbar">
      <slot name="toolbar" />
    </div>
    <div class="ui-table__scroll" role="region" :aria-label="caption" tabindex="0">
      <table>
        <caption :class="{ 'ui-sr-only': captionVisuallyHidden }">
          {{
            caption
          }}
        </caption>
        <thead>
          <slot name="header" :columns="columns" :leaves="leaves">
            <tr>
              <th
                v-if="selectable"
                class="ui-table__check"
                scope="col"
                :rowspan="grouped ? 2 : undefined"
              >
                <UiCheckbox
                  :model-value="allSelected"
                  :indeterminate="partiallySelected"
                  hide-label
                  label="Select all rows"
                  @update:model-value="toggleAll"
                />
              </th>
              <th
                v-if="hasDetail"
                class="ui-table__expand"
                scope="col"
                :rowspan="grouped ? 2 : undefined"
              >
                <span class="ui-sr-only">Details</span>
              </th>
              <th
                v-for="column in columns"
                :key="column.id"
                scope="col"
                :colspan="spanOf(column)"
                :rowspan="rowSpanOf(column)"
                :data-align="column.align"
                :data-group="isGroup(column) || undefined"
                :aria-sort="isGroup(column) ? undefined : ariaSort(column)"
                :style="columnStyle(column)"
              >
                <button
                  v-if="column.sortable && !isGroup(column)"
                  class="ui-table__sort"
                  type="button"
                  @click="toggleSort(column)"
                >
                  <slot :name="`header-${column.id}`">{{ column.header }}</slot>
                  <span class="ui-table__mark" aria-hidden="true">↑</span>
                </button>
                <slot v-else :name="`header-${column.id}`">{{ column.header }}</slot>
              </th>
              <th
                v-if="hasActions"
                class="ui-table__actions"
                scope="col"
                :rowspan="grouped ? 2 : undefined"
              >
                <slot name="actions-header">Actions</slot>
              </th>
            </tr>
            <tr v-if="grouped">
              <th
                v-for="column in groupLeaves"
                :key="column.id"
                scope="col"
                :data-align="column.align"
                :aria-sort="ariaSort(column)"
                :style="columnStyle(column)"
              >
                <button
                  v-if="column.sortable"
                  class="ui-table__sort"
                  type="button"
                  @click="toggleSort(column)"
                >
                  <slot :name="`header-${column.id}`">{{ column.header }}</slot>
                  <span class="ui-table__mark" aria-hidden="true">↑</span>
                </button>
                <slot v-else :name="`header-${column.id}`">{{ column.header }}</slot>
              </th>
            </tr>
          </slot>
        </thead>
        <tbody v-if="loading">
          <tr>
            <td class="ui-table__loading" :colspan="columnCount">
              <UiSpinner decorative />
              <span>Loading rows</span>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="visibleRows.length === 0">
          <tr>
            <td class="ui-table__empty" :colspan="columnCount">
              <slot name="empty">
                <UiEmpty title="No results" description="Nothing matches this view." variant="plain" />
              </slot>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <template v-for="(row, index) in visibleRows" :key="rowKey(row)">
            <tr
              :data-stripe="zebra && index % 2 === 1 ? '' : undefined"
              :data-selected="isSelected(row) || undefined"
            >
              <td v-if="selectable" class="ui-table__check">
                <UiCheckbox
                  :model-value="isSelected(row)"
                  hide-label
                  :label="`Select ${labelFor(row)}`"
                  @update:model-value="toggleRow(row, $event)"
                />
              </td>
              <td v-if="hasDetail" class="ui-table__expand">
                <button
                  type="button"
                  :aria-expanded="isExpanded(row)"
                  :aria-controls="isExpanded(row) ? detailId(row) : undefined"
                  :aria-label="`Details for ${labelFor(row)}`"
                  @click="toggleExpand(row)"
                >
                  <slot name="expand" :row="row" :expanded="isExpanded(row)">
                    {{ isExpanded(row) ? '−' : '+' }}
                  </slot>
                </button>
              </td>
              <td v-for="column in leaves" :key="column.id" :data-align="column.align">
                <slot :name="`cell-${column.id}`" :row="row" :value="cellText(column, row)">
                  {{ cellText(column, row) }}
                </slot>
              </td>
              <td v-if="hasActions" class="ui-table__actions">
                <slot name="actions" :row="row" />
              </td>
            </tr>
            <tr v-if="hasDetail && isExpanded(row)" :id="detailId(row)" class="ui-table__detail">
              <td :colspan="columnCount">
                <slot name="detail" :row="row" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <div v-if="$slots.footer" class="ui-table__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-table__scroll {
  max-height: var(--ui-table-max-height, 32rem);
  overflow: auto;
  border: 1px solid var(--ui-table-border, var(--ui-color-border));
  border-radius: var(--ui-table-radius, var(--ui-radius-lg));
  background: var(--ui-table-bg, var(--ui-color-surface));

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }
}

.ui-table[data-embedded='true'] {
  width: 100%;
  min-width: 0;
}

.ui-table[data-embedded='true'] .ui-table__scroll {
  max-height: none;
  overflow-x: auto;
  overflow-y: visible;
}

.ui-table[data-layout='fixed'] table {
  table-layout: fixed;
}

.ui-table__toolbar,
.ui-table__footer {
  min-width: 0;
  padding: var(--ui-space-3) var(--ui-space-4);
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: var(--ui-font-size-sm);
  font-variant-numeric: tabular-nums;
}

caption {
  padding: var(--ui-space-3) var(--ui-space-4);
  caption-side: bottom;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  text-align: start;
}

th,
td {
  min-width: 0;
  padding: var(--ui-space-3) var(--ui-space-4);
  border-bottom: 1px solid var(--ui-color-border);
  text-align: start;
  vertical-align: middle;
}

td :deep(:is(.ui-field, .ui-input, .ui-select, .ui-textarea, .ui-form, .ui-button)) {
  max-width: 100%;
}

td :deep(:is(.ui-field, .ui-input, .ui-select, .ui-textarea, .ui-form)) {
  width: 100%;
  min-width: 0;
}

.ui-table[data-density='compact'] :is(th, td) {
  padding: var(--ui-space-2) var(--ui-space-3);
}

th[data-align='end'],
td[data-align='end'] {
  text-align: end;
}

th[data-align='center'],
td[data-align='center'] {
  text-align: center;
}

.ui-table {
  --_head: 2.25rem;
}

.ui-table[data-density='compact'] {
  --_head: 1.85rem;
}

thead {
  position: sticky;
  top: 0;
  z-index: 2;
}

thead th {
  height: var(--_head);
  padding-block: 0;
  background: var(--ui-color-subtle);
  box-sizing: border-box;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  font-weight: 650;
  letter-spacing: 0.04em;
  line-height: 1;
  text-transform: uppercase;
  vertical-align: middle;
  white-space: nowrap;
}

.ui-table[data-grouped] thead th[rowspan='2'] {
  height: calc(var(--_head) * 2);
  padding-top: var(--_head);
}

thead th[data-group] {
  text-align: center;
}

.ui-table__check {
  width: 2.75rem;
}

.ui-table__sort {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-1);
  max-width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  transition:
    color var(--ui-duration) var(--ui-ease),
    transform var(--ui-duration-press) var(--ui-ease);

  @include focus-ring(2px);

  &:hover {
    color: var(--ui-color-fg);
  }

  &:active {
    transform: scale(var(--ui-press-scale));
  }
}

.ui-table__mark {
  opacity: 0.35;
  transition:
    opacity var(--ui-duration) var(--ui-ease),
    transform var(--ui-duration) var(--ui-ease);
}

th[aria-sort='ascending'] .ui-table__mark,
th[aria-sort='descending'] .ui-table__mark {
  opacity: 1;
}

th[aria-sort='descending'] .ui-table__mark {
  transform: rotate(180deg);
}

.ui-table__loading {
  color: var(--ui-color-muted);
  text-align: center;
}

.ui-table__empty {
  padding-block: var(--ui-space-6);
  text-align: center;
}

tbody td[colspan] :deep(.ui-spinner) {
  margin-inline-end: var(--ui-space-2);
  vertical-align: middle;
}

tbody tr {
  transition: background-color var(--ui-duration) var(--ui-ease);
}

.ui-table[data-zebra='true'] tbody tr[data-stripe]:not([data-selected='true']) {
  background: var(--ui-color-subtle);
}

tbody tr:hover:not([data-selected='true'], :has(:focus-within)) {
  background: var(--ui-table-row-hover, var(--ui-color-surface-raised));
}

tbody tr[data-selected='true'] {
  background: var(--ui-table-row-selected, var(--ui-color-accent-subtle));
}

.ui-table__expand {
  width: 2.25rem;
  padding-inline: var(--ui-space-2);
}

.ui-table__expand button {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }
}

.ui-table__actions {
  position: sticky;
  inset-inline-end: 0;
  z-index: 1;
  width: 1%;
  background: var(--ui-color-surface);
  box-shadow: -1px 0 0 var(--ui-color-border);
  white-space: nowrap;
}

thead .ui-table__actions {
  z-index: 3;
  background: var(--ui-color-subtle);
}

tbody tr[data-stripe] .ui-table__actions {
  background: var(--ui-color-subtle);
}

tbody tr[data-selected='true'] .ui-table__actions {
  background: var(--ui-table-row-selected, var(--ui-color-accent-subtle));
}

tbody tr:hover .ui-table__actions {
  background: var(--ui-table-row-hover, var(--ui-color-surface-raised));
}

.ui-table__detail td {
  text-align: start;
  background: var(--ui-color-subtle);
}
</style>
