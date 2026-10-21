<script setup lang="ts" generic="T extends object">
import { computed, useSlots, watch } from 'vue'
import { UiEmpty } from '@/components/empty'
import { UiPagination } from '@/components/pagination'
import { UiTable, sortRows, type UiColumn, type UiSortState } from '@/components/table'
import { useControllable } from '@/composables/use-controllable'
import { columnsFrom, rowKeyOf, type DataColumn, type DataTableSchema } from './schema'

const {
  schema,
  rows,
  loading = false,
  embedded = false,
  sort,
  defaultSort = null,
  selected,
  defaultSelected = [],
  expanded,
  defaultExpanded = [],
  page,
  pageSize,
} = defineProps<{
  schema: DataTableSchema<T>
  rows: readonly T[]
  loading?: boolean
  embedded?: boolean
  sort?: UiSortState | null
  defaultSort?: UiSortState | null
  selected?: readonly string[]
  defaultSelected?: readonly string[]
  expanded?: readonly string[]
  defaultExpanded?: readonly string[]
  page?: number
  pageSize?: number
}>()

const emit = defineEmits<{
  'update:sort': [value: UiSortState | null]
  'update:selected': [value: string[]]
  'update:expanded': [value: string[]]
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
}>()

defineSlots<{
  empty(): unknown
  toolbar(): unknown
  header?(props: { columns: readonly UiColumn<T>[]; leaves: readonly UiColumn<T>[] }): unknown
  detail?(props: { row: T }): unknown
  actions?(props: { row: T }): unknown
  'actions-header'?(): unknown
  expand?(props: { row: T; expanded: boolean }): unknown
  [key: `header-${string}`]: () => unknown
  [key: `cell-${string}`]: (props: { row: T; value: string | number }) => unknown
}>()

const slots = useSlots()
const sortState = useControllable<UiSortState | null>({
  value: () => sort,
  defaultValue: () => defaultSort,
  onChange: (next) => {
    emit('update:sort', next)
  },
})
const pageState = useControllable({
  value: () => page,
  defaultValue: 1,
  onChange: (next) => {
    emit('update:page', next)
  },
})
const sizeState = useControllable({
  value: () => pageSize,
  defaultValue: () => schema.pageSizes?.[0] ?? 10,
  onChange: (next) => {
    emit('update:pageSize', next)
  },
})

const columns = computed(() => columnsFrom(schema.columns))
const sortValue = computed(() => sortState.value.value)
const pageValue = computed(() => pageState.value.value)
const sizeValue = computed(() => sizeState.value.value)
const leaves = computed(() => {
  const flat: UiColumn<T>[] = []
  const visit = (items: readonly UiColumn<T>[]): void => {
    for (const item of items) {
      if (item.children && item.children.length > 0) visit(item.children)
      else flat.push(item)
    }
  }
  visit(columns.value)
  return flat
})
const activeColumn = computed(() =>
  leaves.value.find((item) => item.id === sortState.value.value?.columnId),
)
const sorted = computed(() => sortRows(rows, activeColumn.value, sortState.value.value?.direction))
const paged = computed(() => {
  const sizes = schema.pageSizes
  if (!sizes || sizes.length === 0) return sorted.value
  const size = sizeState.value.value
  const start = (pageState.value.value - 1) * size
  return sorted.value.slice(start, start + size)
})
const pageCount = computed(() => {
  const sizes = schema.pageSizes
  if (!sizes || sizes.length === 0) return 1
  return Math.max(1, Math.ceil(sorted.value.length / Math.max(sizeState.value.value, 1)))
})
const columnSlots = computed(() => {
  const cells: `cell-${string}`[] = []
  const headers: `header-${string}`[] = []
  const visit = (items: readonly DataColumn<T>[]): void => {
    for (const item of items) {
      const cell: `cell-${string}` = `cell-${item.id}`
      const header: `header-${string}` = `header-${item.id}`
      if (slots[cell]) cells.push(cell)
      if (slots[header]) headers.push(header)
      if (item.children) visit(item.children)
    }
  }
  visit(schema.columns)
  return { cells, headers }
})

function keyFor(row: T): string {
  return rowKeyOf(row, schema.rowKey)
}

watch(pageCount, (count) => {
  if (pageState.value.value > count) pageState.setValue(count)
})
</script>

<template>
  <div class="ui-data">
    <div v-if="slots.toolbar" class="ui-data__toolbar">
      <slot name="toolbar" />
    </div>
    <UiTable
      :sort="sortValue"
      :selected="selected"
      :expanded="expanded"
      :default-selected="defaultSelected"
      :default-expanded="defaultExpanded"
      :columns="columns"
      :rows="paged"
      :row-key="keyFor"
      :caption="schema.caption"
      :selectable="schema.selectable"
      :zebra="schema.zebra"
      :density="schema.density"
      :layout="schema.layout"
      :embedded="embedded"
      :loading="loading"
      @update:sort="sortState.setValue"
      @update:selected="emit('update:selected', $event)"
      @update:expanded="emit('update:expanded', $event)"
    >
      <template v-if="slots.header" #header="scope">
        <slot name="header" v-bind="scope" />
      </template>
      <template v-if="slots.detail" #detail="scope">
        <slot name="detail" v-bind="scope" />
      </template>
      <template v-if="slots.actions" #actions="scope">
        <slot name="actions" v-bind="scope" />
      </template>
      <template v-if="slots['actions-header']" #actions-header>
        <slot name="actions-header" />
      </template>
      <template v-if="slots.expand" #expand="scope">
        <slot name="expand" v-bind="scope" />
      </template>
      <template v-for="name in columnSlots.cells" :key="name" #[name]="scope">
        <slot :name="name" v-bind="scope" />
      </template>
      <template v-for="name in columnSlots.headers" :key="name" #[name]>
        <slot :name="name" />
      </template>
      <template #empty>
        <slot name="empty">
          <UiEmpty
            :title="schema.emptyTitle ?? 'No results'"
            :description="schema.emptyDescription"
            variant="plain"
          />
        </slot>
      </template>
    </UiTable>
    <div v-if="schema.pageSizes && schema.pageSizes.length > 0" class="ui-data__pager">
      <UiPagination
        :page="pageValue"
        :page-size="sizeValue"
        :page-count="pageCount"
        :page-sizes="schema.pageSizes"
        :label="`${schema.caption} pages`"
        @update:page="pageState.setValue"
        @update:page-size="sizeState.setValue"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-data {
  display: grid;
  gap: var(--ui-space-3);
  min-width: 0;
}

.ui-data__toolbar {
  min-width: 0;
}

.ui-data__pager {
  display: flex;
  justify-content: flex-end;
  min-width: 0;
}
</style>
