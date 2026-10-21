import { describe, expect, it } from 'vitest'
import { cursorFromCount, formatInput, significantCount } from './format'
import type { UiInputFormatContext } from './input.types'

const en: UiInputFormatContext = { locale: 'en-US', currency: 'USD', fractionDigits: 2 }
const ru: UiInputFormatContext = { locale: 'ru-RU', currency: 'RUB', fractionDigits: 2 }

describe('formatInput', () => {
  it('groups phone numbers and keeps a canonical digit string', () => {
    expect(formatInput('phone', '9991234567', en, 'edit')).toEqual({
      display: '(999) 123-45-67',
      value: '9991234567',
    })
    expect(formatInput('phone', '+79991234567', en, 'edit').value).toBe('+79991234567')
  })

  it('spaces card digits and compacts the stored value', () => {
    expect(formatInput('credit-card', '4242424242424242', en, 'edit')).toEqual({
      display: '4242 4242 4242 4242',
      value: '4242424242424242',
    })
  })

  it('formats currency with a locale grouping and a dot canonical value', () => {
    expect(formatInput('currency', '1234.5', en, 'edit')).toMatchObject({
      display: '1,234.5',
      value: '1234.5',
    })
    expect(formatInput('currency', '1234.5', en, 'model', true)).toMatchObject({
      display: '1,234.50',
      value: '1234.50',
    })
    expect(formatInput('currency', '1234,5', ru, 'edit').value).toBe('1234.5')
  })

  it('turns a complete day-month-year into an ISO date', () => {
    expect(formatInput('date', '31122026', ru, 'edit')).toEqual({
      display: '31.12.2026',
      value: '2026-12-31',
    })
    expect(formatInput('date', '2026-12-31', ru, 'model').display).toBe('31.12.2026')
    expect(formatInput('date', '12312026', en, 'edit')).toEqual({
      display: '12/31/2026',
      value: '2026-12-31',
    })
  })

  it('groups IBAN characters in fours', () => {
    expect(formatInput('iban', 'de89370400440532013000', en, 'edit')).toEqual({
      display: 'DE89 3704 0044 0532 0130 00',
      value: 'DE89370400440532013000',
    })
  })
})

describe('caret mapping', () => {
  it('keeps the caret on the same significant character after grouping', () => {
    const edited = '1234.5'
    const count = significantCount('currency', edited, edited.length)
    const formatted = formatInput('currency', edited, en, 'edit')
    expect(cursorFromCount('currency', formatted.display, count)).toBe(formatted.display.length)
  })
})
