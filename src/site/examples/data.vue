<script setup lang="ts">
import { defineTable, UiDataTable, UiDescription, UiImage, UiList, UiMeter, UiSpark, UiStat, UiTable, UiTimeline } from '@/index'

const { name } = defineProps<{ name: string }>()

interface Row {
  id: string
  client: string
  total: number
}

const rows: readonly Row[] = [
  { id: '1', client: 'North dock', total: 1840 },
  { id: '2', client: 'Harbor', total: 960 },
]

const columns = [
  { id: 'client', header: 'Client', cell: (row: Row) => row.client },
  { id: 'total', header: 'Total', align: 'end' as const, cell: (row: Row) => row.total },
]

const table = defineTable<Row>({
  caption: 'Invoices',
  rowKey: 'id',
  zebra: true,
  columns: [
    { id: 'client', header: 'Client', field: 'client' },
    { id: 'total', header: 'Total', field: 'total', align: 'end' },
  ],
})

const facts = [
  { term: 'Client', detail: 'North dock' },
  { term: 'Status', detail: 'Filed' },
]

const preview =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#123"/><text x="32" y="180" fill="#e8e8e8" font-size="32">Harbor</text></svg>',
  )

const day = [
  { id: 'open', title: 'Desk opens', time: '09:00', description: 'The brief is on the desk.' },
  { id: 'file', title: 'Filed', time: '18:00', description: 'Three berths stay open.' },
]

function rowKey(row: Row): string {
  return row.id
}
</script>

<template>
  <ui-data-table v-if="name === 'UiDataTable'" :schema="table" :rows="rows" />

  <ui-description v-else-if="name === 'UiDescription'" :items="facts" label="Invoice" />

  <ui-image v-else-if="name === 'UiImage'" :src="preview" alt="Harbor" ratio="16 / 9" />

  <ui-list v-else-if="name === 'UiList'" :items="['Draft', 'Review', 'File']" />

  <ui-meter v-else-if="name === 'UiMeter'" label="Capacity" :value="64" />

  <ui-spark v-else-if="name === 'UiSpark'" label="Invoices" :values="[2, 4, 3, 8, 6, 9]" />

  <ui-stat v-else-if="name === 'UiStat'" label="Open" value="18" hint="+3 this week" tone="success" />

  <ui-table
    v-else-if="name === 'UiTable'"
    :columns="columns"
    :rows="rows"
    :row-key="rowKey"
    caption="Invoices"
    zebra
  />

  <ui-timeline v-else-if="name === 'UiTimeline'" :items="day" label="Desk day" />
</template>
