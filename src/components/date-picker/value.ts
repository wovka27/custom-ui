export interface UiDateRange {
  start: string | null
  end: string | null
}

export type UiDateValue = string | null | UiDateRange

export function isDateRange(value: unknown): value is UiDateRange {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  if (!('start' in value) || !('end' in value)) return false
  const start = value.start
  const end = value.end
  const ok = (item: unknown): item is string | null => item === null || typeof item === 'string'
  return ok(start) && ok(end)
}
