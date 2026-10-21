export type UiInputType = 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' | 'number'

export type UiInputFormat =
  | 'phone'
  | 'currency'
  | 'percent'
  | 'integer'
  | 'decimal'
  | 'date'
  | 'time'
  | 'credit-card'
  | 'iban'
  | 'postal'

export interface UiInputFormatContext {
  locale: string
  currency: string
  fractionDigits: number
}
