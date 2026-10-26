import type { ConcreteComponent } from 'vue'
import preview from '@sb/preview'
import { UiBadge } from '@/components/badge'
import { UiForm, defineForm } from '@/components/form'
import { UiTable } from '@/components/table'
import type { UiColumn } from '@/components/table'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

interface Invoice {
  id: string
  client: string
  status: 'Paid' | 'Open' | 'Overdue'
  total: string
}

const rows: readonly Invoice[] = [
  { id: 'inv-1048', client: 'Northwind Atelier', status: 'Paid', total: '$1,840.00' },
  { id: 'inv-1052', client: 'Harbor & Co', status: 'Open', total: '$960.00' },
  { id: 'inv-1059', client: 'Lumen Press', status: 'Overdue', total: '$2,420.00' },
]

const columns: readonly UiColumn<Invoice>[] = [
  { id: 'client', header: 'Client', sortable: true, cell: (row) => row.client },
  { id: 'status', header: 'Status', sortable: true, cell: (row) => row.status },
  { id: 'total', header: 'Total', sortable: true, align: 'end', cell: (row) => row.total },
]

const groupedColumns: readonly UiColumn<Invoice>[] = [
  { id: 'client', header: 'Client', cell: (row) => row.client },
  {
    id: 'billing',
    header: 'Billing',
    children: [
      { id: 'status', header: 'Status', cell: (row) => row.status },
      { id: 'total', header: 'Total', align: 'end', cell: (row) => row.total },
    ],
  },
]

const embeddedColumns: readonly UiColumn<Invoice>[] = [
  { id: 'client', header: 'Client', cell: (row) => row.client, width: '34%' },
  { id: 'note', header: 'Note', cell: () => '', minWidth: '16rem' },
]

const line = defineForm([
  {
    kind: 'text',
    name: 'note',
    label: 'Note',
    placeholder: 'Internal note',
    span: 'full',
  },
])

const meta = preview.meta({
  title: 'Data/Table',
  component: UiTable as ConcreteComponent,
  args: {
    caption: 'Open and settled invoices',
    columns,
    rows,
    selectable: true,
    zebra: true,
    loading: false,
    density: 'comfortable',
    rowKey: (row: Invoice) => row.id,
    rowLabel: (row: Invoice) => row.client,
  },
  argTypes: {
    density: { control: 'inline-radio', options: ['compact', 'comfortable'] },
    columns: { control: false },
    rows: { control: false },
    rowKey: { control: false },
    rowLabel: { control: false },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: {
      UiBadge,
      UiForm,
      UiTable: UiTable as ConcreteComponent,
      ShowcaseBoard,
      ShowcaseCase,
    },
    setup: () => ({ columns, embeddedColumns, groupedColumns, line, rows }),
    template: `
    <showcase-board>
      <showcase-case title="Selection and sort">
        <ui-table
          caption="Open and settled invoices"
          :columns="columns"
          :rows="rows"
          :row-key="(row) => row.id"
          :row-label="(row) => row.client"
          selectable
          zebra
        >
          <template #cell-status="{ row }">
            <ui-badge :tone="row.status === 'Paid' ? 'success' : row.status === 'Overdue' ? 'danger' : 'info'">
              {{ row.status }}
            </ui-badge>
          </template>
        </ui-table>
      </showcase-case>
      <showcase-case title="Empty">
        <ui-table
          caption="No matches"
          :columns="columns"
          :rows="[]"
          :row-key="(row) => row.id"
        >
          <template #empty>No clients match that search.</template>
        </ui-table>
      </showcase-case>
      <showcase-case title="Loading">
        <ui-table caption="Loading invoices" :columns="columns" :rows="rows" :row-key="(row) => row.id" loading />
      </showcase-case>
      <showcase-case title="Groups, details, actions" note="One header can cover several cells. Details open under the row. Actions stay on the right.">
        <ui-table caption="Grouped invoices" :columns="groupedColumns" :rows="rows" :row-key="(row) => row.id" :row-label="(row) => row.client">
          <template #detail="{ row }">Issued as {{ row.id }}.</template>
          <template #actions="{ row }">
            <button type="button">Open {{ row.id }}</button>
          </template>
        </ui-table>
      </showcase-case>
      <showcase-case title="Form in a cell" note="A region form stays inside the cell without nesting a form element.">
        <ui-table
          embedded
          layout="fixed"
          caption="Invoice notes"
          :columns="embeddedColumns"
          :rows="rows"
          :row-key="(row) => row.id"
        >
          <template #cell-note>
            <ui-form as="region" :schema="line" submit-label="Save note" columns="100%" />
          </template>
        </ui-table>
      </showcase-case>
    </showcase-board>
  `,
  })),
)
