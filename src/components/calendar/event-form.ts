import { defineForm, group, type FormRule, type FormValues } from '@/components/form'
import {
  clockLabel,
  eventDay,
  eventFromDraft,
  isAllDay,
  type CalendarDraft,
  type CalendarEvent,
  type CalendarTone,
} from './board'

const tones = [
  { value: 'neutral', label: 'Neutral' },
  { value: 'accent', label: 'Accent' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'danger', label: 'Danger' },
] as const

function allDay(values: Readonly<FormValues>): boolean {
  return values.allDay === true
}

function timed(values: Readonly<FormValues>): boolean {
  return values.allDay !== true
}

const orderRule: FormRule = {
  validate(_value, values) {
    const draft = draftFrom(values)
    if (!draft) return undefined
    const titled = draft.title.trim().length > 0 ? draft : { ...draft, title: 'Event' }
    return eventFromDraft('draft', titled) ? undefined : 'End must be after the start.'
  },
}

export const eventForm = defineForm([
  { kind: 'text', name: 'title', label: 'Title', required: true, placeholder: 'File the brief' },
  { kind: 'textarea', name: 'detail', label: 'Detail', rows: 2 },
  { kind: 'switch', name: 'allDay', label: 'All day' },
  { kind: 'select', name: 'tone', label: 'Tone', options: tones },
  group({
    id: 'when',
    columns: '12rem',
    fields: [
      {
        kind: 'date',
        name: 'startDay',
        label: 'Start',
        required: true,
        when: allDay,
      },
      {
        kind: 'date',
        name: 'endDay',
        label: 'End',
        required: true,
        rules: [orderRule],
        when: allDay,
      },
      {
        kind: 'datetime',
        name: 'startAt',
        label: 'Start',
        required: true,
        when: timed,
      },
      {
        kind: 'datetime',
        name: 'endAt',
        label: 'End',
        required: true,
        rules: [orderRule],
        when: timed,
      },
    ],
  }),
])

export function createEventValues(day: string, time: string): FormValues {
  return {
    title: '',
    detail: '',
    allDay: false,
    tone: 'accent',
    startDay: day,
    endDay: day,
    startAt: `${day}T${time}`,
    endAt: `${day}T${later(time)}`,
  }
}

export function editEventValues(event: CalendarEvent): FormValues {
  const start = eventDay(event.start) ?? ''
  const end = eventDay(event.end) ?? start
  return {
    title: event.title,
    detail: event.detail ?? '',
    allDay: isAllDay(event),
    tone: event.tone ?? 'neutral',
    startDay: start,
    endDay: end,
    startAt: clockLabel(event.start) ? event.start : `${start}T09:00`,
    endAt: clockLabel(event.end) ? event.end : `${end}T10:00`,
  }
}

export function eventFromForm(id: string, values: Readonly<FormValues>): CalendarEvent | null {
  const draft = draftFrom(values)
  if (!draft) return null
  return eventFromDraft(id, draft)
}

function draftFrom(values: Readonly<FormValues>): CalendarDraft | null {
  const tone = readTone(values.tone)
  const title = readText(values.title)
  const detail = readText(values.detail)
  if (values.allDay === true) {
    return {
      title,
      detail,
      allDay: true,
      startDay: readText(values.startDay),
      endDay: readText(values.endDay),
      startTime: '09:00',
      endTime: '10:00',
      tone,
    }
  }
  const start = readText(values.startAt)
  const end = readText(values.endAt)
  const startDay = eventDay(start)
  const endDay = eventDay(end)
  if (!startDay || !endDay) return null
  return {
    title,
    detail,
    allDay: false,
    startDay,
    endDay,
    startTime: clockLabel(start) ?? '',
    endTime: clockLabel(end) ?? '',
    tone,
  }
}

function readText(value: FormValues[string] | undefined): string {
  return typeof value === 'string' ? value : ''
}

function readTone(value: FormValues[string] | undefined): CalendarTone {
  if (
    value === 'neutral' ||
    value === 'accent' ||
    value === 'success' ||
    value === 'warning' ||
    value === 'danger'
  ) {
    return value
  }
  return 'neutral'
}

function later(time: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time)
  const hoursText = match?.[1]
  const minutesText = match?.[2]
  if (!hoursText || !minutesText) return time
  const total = Number(hoursText) * 60 + Number(minutesText) + 30
  const hours = Math.floor(total / 60) % 24
  const minutes = ((total % 60) + 60) % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}
