<script setup lang="ts">
import { computed, inject } from 'vue'
import { UiInput } from '@/components/input'
import { UiTable } from '@/components/table'
import type { UiColumn } from '@/components/table'
import { formContextKey } from './context'
import {
  emptyTableValue,
  isFormQuery,
  isFormTableRows,
  isFormTableValue,
  rowsKey,
  type FormAsyncState,
  type FormTableField,
  type FormTableRow,
  type FormTableValue,
} from './schema'

const { field } = defineProps<{
  field: FormTableField
  disabled?: boolean
}>()

const form = inject(formContextKey)
if (!form) throw new Error('UiFormTable must be used inside UiForm.')

const rowState = computed(() =>
  isFormQuery(field.rows) ? form.queries.value[rowsKey(field.name)] : undefined,
)
const rows = computed((): readonly FormTableRow[] => {
  if (!isFormQuery(field.rows)) return field.rows
  const data = stateData(rowState.value)
  return isFormTableRows(data) ? data : []
})
const loading = computed(() => rowState.value?.status === 'pending' && rows.value.length === 0)
const value = computed(() => {
  const raw = form.values.value[field.name]
  return isFormTableValue(raw) ? raw : emptyTableValue()
})
const columns = computed<readonly UiColumn<FormTableRow>[]>(() =>
  field.columns.map((column) => ({
    id: column.id,
    header: column.header,
    align: column.align,
    width: column.width,
    minWidth: column.minWidth ?? (column.editable ? '9rem' : undefined),
    cell: (row) => shown(row, column.id),
  })),
)

function stateData(state: FormAsyncState<unknown> | undefined): unknown {
  if (!state || state.status === 'idle') return undefined
  return state.data
}

function shown(row: FormTableRow, columnId: string): string {
  return value.value.cells[row.id]?.[columnId] ?? row.cells[columnId] ?? ''
}

function rowKey(row: FormTableRow): string {
  return row.id
}

function rowLabel(row: FormTableRow): string {
  const columnId = field.columns[0]?.id
  const text = columnId ? shown(row, columnId) : ''
  return text.length > 0 ? text : row.id
}

function write(next: FormTableValue): void {
  form?.setValue(field.name, next)
}

function onSelected(selected: string[]): void {
  write({ selected, cells: value.value.cells })
}

function onCell(rowId: string, columnId: string, text: string): void {
  const rowEdits = { ...(value.value.cells[rowId] ?? {}), [columnId]: text }
  write({
    selected: value.value.selected,
    cells: { ...value.value.cells, [rowId]: rowEdits },
  })
}
</script>

<template>
  <ui-table
    embedded
    layout="fixed"
    :caption="field.caption"
    caption-visually-hidden
    :columns="columns"
    :rows="rows"
    :row-key="rowKey"
    :row-label="rowLabel"
    :selectable="field.selectable !== false"
    :selected="value.selected"
    :loading="loading"
    density="compact"
    @update:selected="onSelected"
  >
    <template v-for="column in field.columns" :key="column.id" #[`cell-${column.id}`]="{ row }">
      <ui-input
        v-if="column.editable"
        :model-value="shown(row, column.id)"
        :name="`${field.name}.${row.id}.${column.id}`"
        :disabled="disabled"
        :aria-label="`${column.header} for ${row.id}`"
        @update:model-value="onCell(row.id, column.id, $event)"
      />
      <span v-else>{{ shown(row, column.id) }}</span>
    </template>
  </ui-table>
</template>
