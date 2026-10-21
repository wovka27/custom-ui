export type UiSize = 'sm' | 'md' | 'lg'

export type UiTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

export type UiGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type UiAlign = 'start' | 'center' | 'end' | 'stretch'

export type UiJustify = 'start' | 'center' | 'end' | 'between'

export type UiTheme = 'light' | 'dark' | 'system'

export interface UiOption<T extends string | number = string> {
  value: T
  label: string
  disabled?: boolean
  hint?: string
}
