export type PageToken = number | 'gap'

export function pageWindow(current: number, count: number): PageToken[] {
  const safeCount = Math.max(0, Math.floor(count))
  if (safeCount <= 0) return []
  const page = Math.min(Math.max(1, Math.floor(current) || 1), safeCount)
  if (safeCount === 1) return [1]
  const clusterEnd = Math.min(safeCount, page === 1 ? 2 : page)
  const clusterStart = page <= 1 ? 1 : page - 1
  if (clusterStart <= 2) return range(1, clusterEnd)
  return [1, 'gap', ...range(clusterStart, clusterEnd)]
}

function range(start: number, end: number): number[] {
  const pages: number[] = []
  for (let page = start; page <= end; page += 1) pages.push(page)
  return pages
}
