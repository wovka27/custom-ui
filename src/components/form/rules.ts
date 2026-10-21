import { isFormSpan, type FormRule, type FormValue, type FormValues } from './schema'

function isEmpty(value: FormValue): boolean {
  if (value === null || value === false) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (isFormSpan(value)) {
    const missing = (item: string | number | null): boolean => item === null || item === ''
    return missing(value.start) || missing(value.end)
  }
  return false
}

export function required(message = 'This field is required.'): FormRule {
  return {
    validate(value) {
      return isEmpty(value) ? message : undefined
    },
  }
}

export function minLength(min: number, message?: string): FormRule {
  return {
    validate(value) {
      if (typeof value !== 'string' || value.trim() === '') return undefined
      return value.length >= min ? undefined : (message ?? `Use at least ${min} characters.`)
    },
  }
}

export function maxLength(max: number, message?: string): FormRule {
  return {
    validate(value) {
      if (typeof value !== 'string') return undefined
      return value.length <= max ? undefined : (message ?? `Use at most ${max} characters.`)
    },
  }
}

export function email(message = 'Enter a valid email address.'): FormRule {
  return {
    validate(value) {
      if (typeof value !== 'string' || value.trim() === '') return undefined
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : message
    },
  }
}

export function pattern(expression: RegExp, message: string): FormRule {
  return {
    validate(value) {
      if (typeof value !== 'string' || value.trim() === '') return undefined
      return expression.test(value) ? undefined : message
    },
  }
}

export function sameAs(other: string, message: string): FormRule {
  return {
    validate(value, values: Readonly<FormValues>) {
      if (isEmpty(value)) return undefined
      return value === values[other] ? undefined : message
    },
  }
}
