export type ClassValue = string | false | null | undefined

export function cn(...values: readonly ClassValue[]): string {
  return values
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ')
}

export function className(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}
