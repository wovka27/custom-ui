import type { UiOption } from '@/types/common'

export interface UiSelectAllOption<T extends string | number = string> {
  label?: string
  value?: T | null
}

export interface ResolvedSelectOption<T extends string | number = string> {
  label: string
  value: T | null
  disabled?: boolean
  hint?: string
}

export function resolveAllOption<T extends string | number>(
  allOption: boolean | UiSelectAllOption<T> | undefined,
): ResolvedSelectOption<T> | null {
  if (!allOption) return null
  if (allOption === true) return { label: 'All', value: null }
  const label = allOption.label?.trim() ? allOption.label : 'All'
  return { label, value: allOption.value === undefined ? null : allOption.value }
}

export function withAllOption<T extends string | number, O extends UiOption<T> = UiOption<T>>(
  options: readonly O[],
  allOption: boolean | UiSelectAllOption<T> | undefined,
): (O | ResolvedSelectOption<T>)[] {
  const extra = resolveAllOption(allOption)
  const items: (O | ResolvedSelectOption<T>)[] = options.map((option) => ({ ...option }))
  if (!extra) return items
  if (extra.value !== null && items.some((option) => option.value === extra.value)) return items
  return [extra, ...items]
}
