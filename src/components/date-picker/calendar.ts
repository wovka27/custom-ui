export interface CalendarDay {
  iso: string
  outside: boolean
  day: number
}

export function parseIso(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!year || !month || !day) return null
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

export function toIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function shiftMonth(
  year: number,
  month: number,
  amount: number,
): { year: number; month: number } {
  const date = new Date(year, month + amount, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}

export function calendarDays(year: number, month: number, weekStartsOn: 0 | 1): CalendarDay[] {
  const first = new Date(year, month, 1)
  const lead = (first.getDay() - weekStartsOn + 7) % 7
  const start = new Date(year, month, 1 - lead)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      iso: toIso(date),
      outside: date.getMonth() !== month,
      day: date.getDate(),
    }
  })
}

export function weekdayLabels(locale: string, weekStartsOn: 0 | 1): string[] {
  const sunday = new Date(2024, 0, 7)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday)
    date.setDate(sunday.getDate() + weekStartsOn + index)
    return new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(date)
  })
}

export function monthLabel(locale: string, year: number, month: number): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  )
}
