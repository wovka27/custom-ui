import type { ConcreteComponent } from 'vue'
import preview from '@sb/preview'
import { UiDataTable, column, defineTable } from '@/components/data-table'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

interface Invoice {
  id: string
  client: string
  status: string
  total: number
  issued: string
}

const rows: readonly Invoice[] = [
  { id: 'inv-1048', client: 'Northwind Atelier', status: 'Paid', total: 1840, issued: '2026-03-02' },
  { id: 'inv-1052', client: 'Harbor & Co', status: 'Open', total: 960, issued: '2026-03-18' },
  { id: 'inv-1059', client: 'Lumen Press', status: 'Overdue', total: 2420, issued: '2026-02-11' },
  { id: 'inv-1064', client: 'Cedar Clinic', status: 'Paid', total: 730, issued: '2026-04-01' },
]

const schema = defineTable<Invoice>({
  caption: 'Generated invoices',
  rowKey: 'id',
  zebra: true,
  selectable: true,
  pageSizes: [2, 4],
  emptyTitle: 'No invoices',
  emptyDescription: 'The schema is ready. The rows are not.',
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
      value: (row) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(row.total),
    }),
  ],
})

const meta = preview.meta({
  title: 'Data/Data table',
  component: UiDataTable as ConcreteComponent,
  args: { schema, rows },
  argTypes: {
    schema: { control: false },
    rows: { control: false },
  },
})

export const Playground = meta.story(
  playground({
    render: () => ({
      components: { UiDataTable: UiDataTable as ConcreteComponent },
      setup: () => ({ schema, rows }),
      template: '<div style="width: min(46rem, 100%)"><UiDataTable :schema="schema" :rows="rows" /></div>',
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiDataTable: UiDataTable as ConcreteComponent, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ schema, rows }),
    template: `
      <ShowcaseBoard>
        <ShowcaseCase title="Schema" note="Columns, groups, sort, selection, and page size come from the config.">
          <UiDataTable :schema="schema" :rows="rows" />
        </ShowcaseCase>
        <ShowcaseCase title="Empty" note="The empty slot can replace the default state.">
          <UiDataTable :schema="schema" :rows="[]" />
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
