import { shiftMonth, toIso } from '@/components/date-picker/calendar'

export type CalendarView = 'month' | 'week' | 'day' | 'agenda'
export type CalendarTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger'

export interface CalendarEvent {
  readonly id: string
  readonly title: string
  readonly start: string
  readonly end: string
  readonly tone?: CalendarTone
  readonly detail?: string
}

export function eventDay(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  if (match[4] !== undefined) {
    const hours = Number(match[4])
    const minutes = Number(match[5])
    if (hours > 23 || minutes > 59) return null
  }
  return `${match[1]}-${match[2]}-${match[3]}`
}

export function clockLabel(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value)
  if (!match || eventDay(value) === null) return null
  return `${match[4]}:${match[5]}`
}

export function addDays(iso: string, amount: number): string {
  const day = eventDay(iso)
  if (!day || !Number.isFinite(amount)) return iso
  const year = Number(day.slice(0, 4))
  const month = Number(day.slice(5, 7))
  const date = Number(day.slice(8, 10))
  return toIso(new Date(year, month - 1, date + Math.trunc(amount)))
}

export function startOfWeek(iso: string, weekStartsOn: 0 | 1): string {
  const day = eventDay(iso)
  if (!day) return iso
  const date = new Date(
    Number(day.slice(0, 4)),
    Number(day.slice(5, 7)) - 1,
    Number(day.slice(8, 10)),
  )
  const lead = (date.getDay() - weekStartsOn + 7) % 7
  return addDays(day, -lead)
}

export function weekDates(iso: string, weekStartsOn: 0 | 1): string[] {
  const start = startOfWeek(iso, weekStartsOn)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function shiftCursor(iso: string, view: CalendarView, amount: number): string {
  const day = eventDay(iso)
  if (!day || !Number.isFinite(amount)) return iso
  const step = Math.trunc(amount)
  if (view === 'week') return addDays(day, step * 7)
  if (view === 'day') return addDays(day, step)
  const year = Number(day.slice(0, 4))
  const month = Number(day.slice(5, 7)) - 1
  const date = Number(day.slice(8, 10))
  const shifted = shiftMonth(year, month, step)
  const last = new Date(shifted.year, shifted.month + 1, 0).getDate()
  return toIso(new Date(shifted.year, shifted.month, Math.min(date, last)))
}

export function eventsOnDay(events: readonly CalendarEvent[], iso: string): CalendarEvent[] {
  const day = eventDay(iso)
  if (!day) return []
  return events.filter((event) => covers(event, day)).sort(compareEvents)
}

export function calendarHeading(
  locale: string,
  iso: string,
  view: CalendarView,
  weekStartsOn: 0 | 1,
): string {
  const day = eventDay(iso)
  if (!day) return ''
  const date = new Date(
    Number(day.slice(0, 4)),
    Number(day.slice(5, 7)) - 1,
    Number(day.slice(8, 10)),
  )
  if (view === 'day') {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }
  if (view === 'week') {
    const start = new Date(
      Number(startOfWeek(day, weekStartsOn).slice(0, 4)),
      Number(startOfWeek(day, weekStartsOn).slice(5, 7)) - 1,
      Number(startOfWeek(day, weekStartsOn).slice(8, 10)),
    )
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).formatRange(start, end)
  }
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(date.getFullYear(), date.getMonth(), 1),
  )
}

export const CALENDAR_DAY_START = 6 * 60
export const CALENDAR_DAY_END = 22 * 60

export interface CalendarSlot {
  readonly day: string
  readonly time: string
}

export interface TimedBlock {
  readonly event: CalendarEvent
  readonly start: number
  readonly end: number
  readonly column: number
  readonly columns: number
}

export interface SpanBar {
  readonly event: CalendarEvent
  readonly start: number
  readonly span: number
  readonly continuesBefore: boolean
  readonly continuesAfter: boolean
}

export function eventMinutes(value: string): number | null {
  const clock = clockLabel(value)
  if (!clock) return null
  return Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3, 5))
}

export function isAllDay(event: CalendarEvent): boolean {
  const start = eventDay(event.start)
  if (!start) return false
  if (clockLabel(event.start) === null) return true
  const end = eventDay(event.end)
  const last = end !== null && end >= start ? end : start
  return last !== start
}

export function hourLabels(): string[] {
  const labels: string[] = []
  for (let minute = CALENDAR_DAY_START; minute < CALENDAR_DAY_END; minute += 60) {
    labels.push(`${String(minute / 60).padStart(2, '0')}:00`)
  }
  return labels
}

export function nowFraction(now: Date): number | null {
  const minutes = now.getHours() * 60 + now.getMinutes()
  if (minutes < CALENDAR_DAY_START || minutes > CALENDAR_DAY_END) return null
  return (minutes - CALENDAR_DAY_START) / (CALENDAR_DAY_END - CALENDAR_DAY_START)
}

export function placeTimed(events: readonly CalendarEvent[], iso: string): TimedBlock[] {
  const drafts: { event: CalendarEvent; start: number; end: number; column: number }[] = []
  for (const event of eventsOnDay(events, iso)) {
    if (isAllDay(event)) continue
    const startMin = eventMinutes(event.start)
    if (startMin === null) continue
    const endMin = eventMinutes(event.end)
    const start = clamp(startMin, CALENDAR_DAY_START, CALENDAR_DAY_END - 30)
    const end = clamp(
      endMin === null || endMin <= startMin ? startMin + 30 : endMin,
      start + 30,
      CALENDAR_DAY_END,
    )
    drafts.push({ event, start, end, column: 0 })
  }
  drafts.sort((left, right) => left.start - right.start || right.end - left.end)

  const placed: TimedBlock[] = []
  let cluster: typeof drafts = []
  let clusterEnd = -1
  function flush(): void {
    if (cluster.length === 0) return
    const columns = cluster.reduce((max, item) => Math.max(max, item.column + 1), 1)
    for (const item of cluster) {
      placed.push({
        event: item.event,
        start: item.start,
        end: item.end,
        column: item.column,
        columns,
      })
    }
    cluster = []
    clusterEnd = -1
  }

  for (const item of drafts) {
    if (cluster.length > 0 && item.start >= clusterEnd) flush()
    const used = cluster.filter((other) => other.end > item.start).map((other) => other.column)
    let column = 0
    while (used.includes(column)) column += 1
    item.column = column
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.end)
  }
  flush()
  return placed
}

export function weekBars(events: readonly CalendarEvent[], days: readonly string[]): SpanBar[] {
  const first = days[0]
  const last = days[days.length - 1]
  if (!first || !last) return []
  const bars: SpanBar[] = []
  for (const event of events) {
    if (!isAllDay(event)) continue
    const start = eventDay(event.start)
    if (!start) continue
    const endDay = eventDay(event.end)
    const end = endDay !== null && endDay >= start ? endDay : start
    if (end < first || start > last) continue
    const visibleStart = start < first ? first : start
    const visibleEnd = end > last ? last : end
    const startIndex = days.indexOf(visibleStart)
    const endIndex = days.indexOf(visibleEnd)
    if (startIndex < 0 || endIndex < startIndex) continue
    bars.push({
      event,
      start: startIndex,
      span: endIndex - startIndex + 1,
      continuesBefore: start < first,
      continuesAfter: end > last,
    })
  }
  return bars
}

export interface CalendarDraft {
  readonly title: string
  readonly detail: string
  readonly allDay: boolean
  readonly startDay: string
  readonly endDay: string
  readonly startTime: string
  readonly endTime: string
  readonly tone: CalendarTone
}

export function eventFromDraft(id: string, draft: CalendarDraft): CalendarEvent | null {
  const title = draft.title.trim()
  const startDay = eventDay(draft.startDay)
  const endDay = eventDay(draft.endDay)
  if (id.length === 0 || title.length === 0 || !startDay || !endDay || endDay < startDay)
    return null
  const detail = draft.detail.trim()
  const tone = draft.tone === 'neutral' ? undefined : draft.tone
  const base = {
    id,
    title,
    ...(detail.length > 0 ? { detail } : {}),
    ...(tone ? { tone } : {}),
  }
  if (draft.allDay) return { ...base, start: startDay, end: endDay }
  const startTime = clockValue(draft.startTime)
  const endTime = clockValue(draft.endTime)
  if (!startTime || !endTime) return null
  if (startDay === endDay && endTime <= startTime) return null
  return { ...base, start: `${startDay}T${startTime}`, end: `${endDay}T${endTime}` }
}

function clockValue(value: string): string | null {
  const match = /^(\d{2}):(\d{2})/.exec(value)
  const hoursText = match?.[1]
  const minutesText = match?.[2]
  if (!hoursText || !minutesText) return null
  const hours = Number(hoursText)
  const minutes = Number(minutesText)
  if (hours > 23 || minutes > 59) return null
  return `${hoursText}:${minutesText}`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function covers(event: CalendarEvent, iso: string): boolean {
  const start = eventDay(event.start)
  if (!start) return false
  const end = eventDay(event.end)
  const last = end !== null && end >= start ? end : start
  return iso >= start && iso <= last
}

function compareEvents(left: CalendarEvent, right: CalendarEvent): number {
  const leftTime = clockLabel(left.start)
  const rightTime = clockLabel(right.start)
  if (leftTime === null && rightTime !== null) return -1
  if (leftTime !== null && rightTime === null) return 1
  if (leftTime !== null && rightTime !== null && leftTime !== rightTime) {
    return leftTime < rightTime ? -1 : 1
  }
  return left.title.localeCompare(right.title)
}
