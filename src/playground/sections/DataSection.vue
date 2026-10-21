<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  UiBadge,
  UiBreadcrumb,
  UiButton,
  UiCluster,
  UiDataTable,
  UiEmpty,
  UiField,
  UiForm,
  UiGrid,
  UiInput,
  UiPagination,
  UiSelect,
  UiStack,
  UiTable,
  column,
  defineForm,
  defineTable,
  sortRows,
  type UiColumn,
  type UiSortState,
  type UiOption,
  type UiTone,
} from '@/index'
import { invoices, type Invoice, type InvoiceStatus } from '../demo-data'

const query = ref('')
const status = ref<InvoiceStatus | null>(null)
const page = ref(1)
const sort = ref<UiSortState | null>(null)
const selected = ref<string[]>([])
const loading = ref(false)
const pageSize = ref(2)
const showGenerated = ref(true)
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

const generated = defineTable<Invoice>({
  caption: 'Generated invoices',
  rowKey: 'id',
  zebra: true,
  pageSizes: [2, 4, 8],
  emptyTitle: 'No invoices',
  emptyDescription: 'Restore the rows to fill this view.',
  columns: [
    column({ id: 'client', header: 'Client', field: 'client', sortable: true }),
    column({
      id: 'schedule',
      header: 'Schedule',
      children: [
        column({ id: 'issued', header: 'Issued', field: 'issued', sortable: true }),
        column({ id: 'month', header: 'Month', value: (row) => row.issued.slice(0, 7) }),
      ],
    }),
    column({
      id: 'total',
      header: 'Total',
      field: 'total',
      align: 'end',
      sortable: true,
      value: (row) => currency.format(row.total),
    }),
  ],
})

const statuses: readonly UiOption<InvoiceStatus>[] = [
  { value: 'Paid', label: 'Paid' },
  { value: 'Open', label: 'Open' },
  { value: 'Overdue', label: 'Overdue' },
]

const noteSchema = defineForm([
  {
    kind: 'text',
    name: 'note',
    label: 'Note',
    placeholder: 'Hold',
    span: 'full',
  },
])

const columns: readonly UiColumn<Invoice>[] = [
  { id: 'client', header: 'Client', sortable: true, cell: (row) => row.client },
  { id: 'status', header: 'Status', sortable: true, cell: (row) => row.status },
  {
    id: 'schedule',
    header: 'Schedule',
    children: [
      { id: 'issued', header: 'Issued', sortable: true, cell: (row) => row.issued },
      { id: 'month', header: 'Month', cell: (row) => row.issued.slice(0, 7) },
    ],
  },
  { id: 'note', header: 'Note', minWidth: '14rem', cell: () => '' },
  {
    id: 'total',
    header: 'Total',
    sortable: true,
    align: 'end',
    cell: (row) => currency.format(row.total),
    sortValue: (row) => row.total,
  },
]

function findColumn(
  items: readonly UiColumn<Invoice>[],
  id: string | undefined,
): UiColumn<Invoice> | undefined {
  if (!id) return undefined
  for (const item of items) {
    if (item.id === id) return item
    const child = item.children ? findColumn(item.children, id) : undefined
    if (child) return child
  }
  return undefined
}

const filtered = computed(() => {
  const needle = query.value.trim().toLocaleLowerCase()
  return invoices.filter((row) => {
    const matchesQuery = !needle || row.client.toLocaleLowerCase().includes(needle)
    const matchesStatus = status.value === null || row.status === status.value
    return matchesQuery && matchesStatus
  })
})

const sorted = computed(() => {
  const column = findColumn(columns, sort.value?.columnId)
  return sortRows(filtered.value, column, sort.value?.direction)
})

const pageCount = computed(() => Math.max(1, Math.ceil(sorted.value.length / pageSize.value)))
const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return sorted.value.slice(start, start + pageSize.value)
})

const selectionLabel = computed(() =>
  selected.value.length === 0 ? 'No rows selected.' : `${selected.value.length} selected.`,
)

watch([query, status], () => {
  page.value = 1
})

watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})

function toneFor(status: InvoiceStatus): UiTone {
  if (status === 'Paid') return 'success'
  if (status === 'Overdue') return 'danger'
  return 'info'
}
</script>

<template>
  <section id="data" class="section" aria-labelledby="data-title">
    <UiStack gap="md">
      <header>
        <UiBreadcrumb
          :items="[
            { id: 'kit', label: 'Custom UI', href: '#forms' },
            { id: 'data', label: 'Invoices' },
          ]"
        />
        <h2 id="data-title" class="section-title">Data</h2>
        <p class="lede">Sortable columns, row selection, and a form that lives inside a cell.</p>
      </header>
      <div class="panel">
        <UiStack gap="md">
          <UiCluster justify="between">
            <search>
              <UiField label="Search clients">
                <UiInput v-model="query" type="search" placeholder="Client name" />
              </UiField>
            </search>
            <UiField label="Status">
              <UiSelect v-model="status" :options="statuses" all-option name="status" />
            </UiField>
            <UiButton variant="secondary" @click="loading = !loading">
              {{ loading ? 'Show rows' : 'Show loading' }}
            </UiButton>
          </UiCluster>
          <UiTable
            v-model:sort="sort"
            v-model:selected="selected"
            :columns="columns"
            :rows="paged"
            :row-key="(row) => row.id"
            :row-label="(row) => row.client"
            caption="Open and settled invoices"
            selectable
            zebra
            embedded
            :loading="loading"
          >
            <template #cell-status="{ row }">
              <UiBadge :tone="toneFor(row.status)">{{ row.status }}</UiBadge>
            </template>
            <template #cell-note="{ row }">
              <UiForm
                as="region"
                :schema="noteSchema"
                :label="`Note for ${row.client}`"
                submit-label="Save note"
                columns="100%"
              />
            </template>
            <template #detail="{ row }">Invoice {{ row.id }} was issued on {{ row.issued }}.</template>
            <template #actions="{ row }">
              <UiButton size="sm" variant="ghost">Open</UiButton>
              <span class="ui-sr-only">{{ row.client }}</span>
            </template>
            <template #empty>No clients match that search.</template>
          </UiTable>
          <UiCluster justify="between">
            <p role="status" class="meta">{{ selectionLabel }}</p>
            <UiPagination
              v-model:page="page"
              v-model:page-size="pageSize"
              :page-sizes="[2, 4, 8]"
              :page-count="pageCount"
              label="Invoice pages"
            />
          </UiCluster>
        </UiStack>
      </div>
      <div class="panel">
        <UiStack gap="md">
          <UiCluster justify="between">
            <p class="meta">Generated from a schema</p>
            <UiButton size="sm" variant="secondary" @click="showGenerated = !showGenerated">
              {{ showGenerated ? 'Clear rows' : 'Restore rows' }}
            </UiButton>
          </UiCluster>
          <UiDataTable :schema="generated" :rows="showGenerated ? invoices : []">
            <template #detail="{ row }">{{ row.id }}</template>
          </UiDataTable>
          <UiGrid min-column="14rem">
            <UiEmpty variant="plain" title="Plain" description="No chrome around the message." />
            <UiEmpty variant="panel" title="Panel" description="A hairline frame for a quiet page." />
            <UiEmpty variant="dashed" title="Dashed" description="A place that is waiting for a file.">
              <template #actions>
                <UiButton size="sm" variant="secondary">Choose</UiButton>
              </template>
            </UiEmpty>
          </UiGrid>
        </UiStack>
      </div>
    </UiStack>
  </section>
</template>
