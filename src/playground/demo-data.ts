export type InvoiceStatus = 'Paid' | 'Open' | 'Overdue'

export interface Invoice {
  id: string
  client: string
  status: InvoiceStatus
  total: number
  issued: string
}

export const invoices: readonly Invoice[] = [
  {
    id: 'inv-1048',
    client: 'Northwind Atelier',
    status: 'Paid',
    total: 1840,
    issued: '2026-03-02',
  },
  { id: 'inv-1052', client: 'Harbor & Co', status: 'Open', total: 960, issued: '2026-03-18' },
  { id: 'inv-1059', client: 'Lumen Press', status: 'Overdue', total: 2420, issued: '2026-02-11' },
  { id: 'inv-1064', client: 'Cedar Clinic', status: 'Paid', total: 730, issued: '2026-04-01' },
  { id: 'inv-1071', client: 'Atlas Foundry', status: 'Open', total: 3180, issued: '2026-04-09' },
  { id: 'inv-1077', client: 'Kindred Studio', status: 'Paid', total: 1290, issued: '2026-04-16' },
  { id: 'inv-1083', client: 'Marble Route', status: 'Overdue', total: 540, issued: '2026-01-28' },
  { id: 'inv-1090', client: 'Fieldnote', status: 'Open', total: 1575, issued: '2026-05-04' },
]
