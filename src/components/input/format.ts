import type { UiInputFormat, UiInputFormatContext } from './input.types'

export interface FormattedValue {
  display: string
  value: string
}

const DECIMAL_FORMATS = new Set<UiInputFormat>(['decimal', 'currency', 'percent'])

export function resolveLocale(locale: string | undefined): string {
  if (locale && locale.trim()) return locale
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language
  return 'en'
}

export function currencyFractionDigits(locale: string, currency: string): number {
  try {
    return (
      new Intl.NumberFormat(locale, { style: 'currency', currency }).resolvedOptions()
        .maximumFractionDigits ?? 2
    )
  } catch {
    return 2
  }
}

export function formatAffix(
  format: UiInputFormat,
  context: UiInputFormatContext,
): { prefix: string; suffix: string } {
  if (format === 'percent') return { prefix: '', suffix: '%' }
  if (format !== 'currency') return { prefix: '', suffix: '' }
  try {
    const parts = new Intl.NumberFormat(context.locale, {
      style: 'currency',
      currency: context.currency,
    }).formatToParts(1)
    const symbol = parts.find((part) => part.type === 'currency')?.value ?? context.currency
    const currencyFirst = parts[0]?.type === 'currency'
    return currencyFirst ? { prefix: symbol, suffix: '' } : { prefix: '', suffix: symbol }
  } catch {
    return { prefix: '', suffix: context.currency }
  }
}

export function formatInput(
  format: UiInputFormat,
  raw: string,
  context: UiInputFormatContext,
  origin: 'edit' | 'model',
  finalize = false,
): FormattedValue {
  switch (format) {
    case 'phone':
      return formatPhone(raw)
    case 'credit-card':
      return formatCard(raw)
    case 'iban':
      return formatGroupedCode(raw, 34)
    case 'postal':
      return formatPostal(raw)
    case 'integer':
      return formatInteger(raw, context.locale)
    case 'decimal':
    case 'percent':
      return formatDecimal(raw, context, origin, false)
    case 'currency':
      return formatDecimal(raw, context, origin, finalize)
    case 'date':
      return formatDate(raw, context.locale, origin)
    case 'time':
      return formatTime(raw, origin)
    default:
      return { display: raw, value: raw }
  }
}

export function significantCount(format: UiInputFormat, text: string, cursor: number): number {
  const decimal = DECIMAL_FORMATS.has(format)
  let count = 0
  let seenSeparator = false
  const end = Math.min(cursor, text.length)
  for (let index = 0; index < end; index += 1) {
    const char = text[index] ?? ''
    if (/\d/.test(char)) count += 1
    else if ((format === 'iban' || format === 'postal') && /[a-z]/i.test(char)) count += 1
    else if (format === 'phone' && char === '+' && index === 0) count += 1
    else if ((format === 'integer' || decimal) && char === '-' && count === 0) count += 1
    else if (decimal && !seenSeparator && (char === '.' || char === ',')) {
      seenSeparator = true
      count += 1
    }
  }
  return count
}

export function cursorFromCount(format: UiInputFormat, text: string, count: number): number {
  if (count <= 0) return 0
  const decimal = DECIMAL_FORMATS.has(format)
  let seen = 0
  let seenSeparator = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? ''
    const significant =
      /\d/.test(char) ||
      ((format === 'iban' || format === 'postal') && /[a-z]/i.test(char)) ||
      (format === 'phone' && char === '+' && index === 0) ||
      ((format === 'integer' || decimal) && char === '-' && seen === 0) ||
      (decimal && !seenSeparator && (char === '.' || char === ','))
    if (decimal && (char === '.' || char === ',')) seenSeparator = true
    if (!significant) continue
    seen += 1
    if (seen >= count) return index + 1
  }
  return text.length
}

function formatPhone(raw: string): FormattedValue {
  const plus = raw.trimStart().startsWith('+')
  const digits = raw.replace(/\D/g, '').slice(0, 15)
  const value = `${plus ? '+' : ''}${digits}`
  if (!digits) return { display: plus ? '+' : '', value }
  if (plus) {
    const countryLength = digits.length > 11 ? digits.length - 10 : 1
    const country = digits.slice(0, countryLength)
    const rest = digits.slice(countryLength)
    const groups = rest.match(/.{1,3}/g) ?? []
    return { display: `+${country}${groups.length > 0 ? ` ${groups.join(' ')}` : ''}`, value }
  }
  if (digits.length < 10) {
    const groups = digits.match(/.{1,3}/g) ?? []
    return { display: groups.join(' '), value }
  }
  const national = digits.slice(-10)
  const prefix = digits.slice(0, -10)
  const body = `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6, 8)}-${national.slice(8)}`
  return { display: prefix ? `${prefix} ${body}` : body, value }
}

function formatCard(raw: string): FormattedValue {
  const digits = raw.replace(/\D/g, '').slice(0, 19)
  const groups = digits.match(/.{1,4}/g) ?? []
  return { display: groups.join(' '), value: digits }
}

function formatGroupedCode(raw: string, max: number): FormattedValue {
  const compact = raw
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
    .slice(0, max)
  const groups = compact.match(/.{1,4}/g) ?? []
  return { display: groups.join(' '), value: compact }
}

function formatPostal(raw: string): FormattedValue {
  const compact = raw
    .toUpperCase()
    .replace(/[^A-Z0-9- ]/g, '')
    .replace(/\s+/g, ' ')
    .trimStart()
    .slice(0, 12)
  return { display: compact, value: compact.replace(/\s/g, '') }
}

function formatInteger(raw: string, locale: string): FormattedValue {
  const minus = raw.trimStart().startsWith('-')
  const digits = raw.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  if (!digits) return { display: minus ? '-' : '', value: minus ? '-' : '' }
  const value = `${minus ? '-' : ''}${digits}`
  return { display: `${minus ? '-' : ''}${groupInteger(digits, locale)}`, value }
}

function formatDecimal(
  raw: string,
  context: UiInputFormatContext,
  origin: 'edit' | 'model',
  finalize: boolean,
): FormattedValue {
  const source = origin === 'model' ? raw.replace('.', decimalSeparator(context.locale)) : raw
  const minus = source.trimStart().startsWith('-')
  const body = source.replace(/[^\d.,]/g, '')
  if (!body) return { display: minus ? '-' : '', value: minus ? '-' : '' }
  const separatorAt = Math.max(body.lastIndexOf('.'), body.lastIndexOf(','))
  const intDigits =
    separatorAt === -1 ? body.replace(/\D/g, '') : body.slice(0, separatorAt).replace(/\D/g, '')
  const fracRaw = separatorAt === -1 ? '' : body.slice(separatorAt + 1).replace(/\D/g, '')
  const dangling = separatorAt !== -1 && separatorAt === body.length - 1
  const normalizedInt = intDigits.replace(/^0+(?=\d)/, '') || (intDigits ? '0' : '')
  const fractionLimit = context.fractionDigits
  const fracDigits = fracRaw.slice(0, fractionLimit)
  const finalizedFrac =
    finalize && !dangling
      ? fracDigits.padEnd(fractionLimit, '0').slice(0, fractionLimit)
      : fracDigits
  const showFraction =
    dangling ||
    finalizedFrac.length > 0 ||
    (finalize && fractionLimit > 0 && normalizedInt.length > 0)
  const canonicalInt = normalizedInt || (showFraction ? '0' : '')
  if (!canonicalInt && !showFraction) return { display: minus ? '-' : '', value: minus ? '-' : '' }
  const value = `${minus ? '-' : ''}${canonicalInt}${showFraction && !dangling ? `.${finalizedFrac}` : ''}`
  const grouped = groupInteger(canonicalInt || '0', context.locale)
  const separator = decimalSeparator(context.locale)
  const displayNumber = showFraction
    ? `${grouped}${separator}${dangling ? '' : finalizedFrac}`
    : grouped
  return { display: `${minus ? '-' : ''}${displayNumber}`, value }
}

function formatDate(raw: string, locale: string, origin: 'edit' | 'model'): FormattedValue {
  const order = dateOrder(locale)
  const separator = order === 'mdy' ? '/' : '.'
  if (origin === 'model' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-')
    if (!year || !month || !day) return { display: raw, value: raw }
    const display = order === 'mdy' ? `${month}/${day}/${year}` : `${day}.${month}.${year}`
    return { display, value: raw }
  }
  const digits = raw.replace(/\D/g, '').slice(0, 8)
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(
    (part) => part.length > 0,
  )
  const display = parts.join(separator)
  if (digits.length < 8) return { display, value: digits }
  const first = digits.slice(0, 2)
  const second = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  const month = order === 'mdy' ? first : second
  const day = order === 'mdy' ? second : first
  const iso = `${year}-${month}-${day}`
  return { display, value: isRealDate(year, month, day) ? iso : digits }
}

function formatTime(raw: string, origin: 'edit' | 'model'): FormattedValue {
  if (origin === 'model' && /^\d{2}:\d{2}$/.test(raw)) return { display: raw, value: raw }
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  const display = digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`
  if (digits.length < 4) return { display, value: digits }
  const hours = Number(digits.slice(0, 2))
  const minutes = Number(digits.slice(2, 4))
  const valid = hours <= 23 && minutes <= 59
  return { display, value: valid ? display : digits }
}

function groupInteger(digits: string, locale: string): string {
  if (!digits) return ''
  const number = Number(digits)
  if (!Number.isSafeInteger(number)) return digits
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0, useGrouping: true }).format(
    number,
  )
}

function decimalSeparator(locale: string): string {
  const part = new Intl.NumberFormat(locale)
    .formatToParts(1.1)
    .find((item) => item.type === 'decimal')
  return part?.value ?? '.'
}

function dateOrder(locale: string): 'mdy' | 'dmy' {
  return locale.toLowerCase().startsWith('en-us') ? 'mdy' : 'dmy'
}

function isRealDate(year: string, month: string, day: string): boolean {
  const y = Number(year)
  const m = Number(month)
  const d = Number(day)
  if (!y || m < 1 || m > 12 || d < 1) return false
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
}
