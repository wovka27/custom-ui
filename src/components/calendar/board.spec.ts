import { describe, expect, it } from 'vitest'
import {
  addDays,
  calendarHeading,
  clockLabel,
  eventDay,
  eventsOnDay,
  isAllDay,
  eventFromDraft,
  nowFraction,
  placeTimed,
  shiftCursor,
  startOfWeek,
  weekBars,
  weekDates,
  type CalendarEvent,
} from './board'

const harbor: CalendarEvent = {
  id: 'harbor',
  title: 'Harbor',
  start: '2026-10-21',
  end: '2026-10-22',
}
const tide: CalendarEvent = {
  id: 'tide',
  title: 'Tide',
  start: '2026-10-23T06:40',
  end: '2026-10-23T07:10',
}
const later: CalendarEvent = {
  id: 'later',
  title: 'Later',
  start: '2026-10-23T09:30',
  end: '2026-10-23T10:00',
}

describe('calendar board', () => {
  it('keeps a timed event on its day and a span on every covered day', () => {
    expect(eventDay('2026-10-23T06:40')).toBe('2026-10-23')
    expect(eventDay('2026-02-31')).toBeNull()
    expect(clockLabel('2026-10-23T06:40')).toBe('06:40')
    expect(clockLabel('2026-10-21')).toBeNull()
    expect(eventsOnDay([harbor, tide], '2026-10-21').map((event) => event.id)).toEqual(['harbor'])
    expect(eventsOnDay([harbor], '2026-10-22').map((event) => event.id)).toEqual(['harbor'])
    expect(eventsOnDay([later, tide, harbor], '2026-10-23').map((event) => event.id)).toEqual([
      'tide',
      'later',
    ])
  })

  it('moves a month, a week, and a day, and clamps the last day', () => {
    expect(shiftCursor('2026-01-31', 'month', 1)).toBe('2026-02-28')
    expect(shiftCursor('2026-10-23', 'agenda', -1)).toBe('2026-09-23')
    expect(shiftCursor('2026-10-23', 'week', 1)).toBe('2026-10-30')
    expect(shiftCursor('2026-10-23', 'day', -1)).toBe('2026-10-22')
    expect(addDays('nope', 1)).toBe('nope')
    expect(startOfWeek('2026-10-23', 1)).toBe('2026-10-19')
    expect(weekDates('2026-10-23', 1)[0]).toBe('2026-10-19')
    expect(weekDates('2026-10-23', 1)).toHaveLength(7)
    expect(calendarHeading('en', '2026-10-23', 'month', 1)).toContain('2026')
    expect(calendarHeading('en', '2026-10-23', 'day', 1)).toContain('23')
  })

  it('lays timed events beside each other and keeps a span on the week', () => {
    const berth: CalendarEvent = {
      id: 'berth',
      title: 'Berth',
      start: '2026-10-23T07:00',
      end: '2026-10-23T08:00',
    }
    const placed = placeTimed([tide, berth, later, harbor], '2026-10-23')
    const tideBlock = placed.find((block) => block.event.id === 'tide')
    const berthBlock = placed.find((block) => block.event.id === 'berth')
    const laterBlock = placed.find((block) => block.event.id === 'later')
    expect(placed.map((block) => block.event.id)).not.toContain('harbor')
    expect(isAllDay(harbor)).toBe(true)
    expect(tideBlock?.columns).toBe(2)
    expect(berthBlock?.columns).toBe(2)
    expect(tideBlock?.column).not.toBe(berthBlock?.column)
    expect(laterBlock?.columns).toBe(1)
    const days = weekDates('2026-10-23', 1)
    expect(weekBars([harbor, tide], days)).toEqual([
      {
        event: harbor,
        start: 2,
        span: 2,
        continuesBefore: false,
        continuesAfter: false,
      },
    ])
    expect(nowFraction(new Date(2026, 9, 23, 14, 0))).toBe(0.5)
    expect(nowFraction(new Date(2026, 9, 23, 5, 0))).toBeNull()
  })

  it('builds an edited event and rejects an empty title or a backwards time', () => {
    const draft = {
      title: ' File the brief ',
      detail: ' Signed ',
      allDay: false,
      startDay: '2026-10-23',
      endDay: '2026-10-23',
      startTime: '09:30',
      endTime: '10:00',
      tone: 'success' as const,
    }
    expect(eventFromDraft('brief', draft)).toEqual({
      id: 'brief',
      title: 'File the brief',
      detail: 'Signed',
      tone: 'success',
      start: '2026-10-23T09:30',
      end: '2026-10-23T10:00',
    })
    expect(eventFromDraft('brief', { ...draft, title: '  ' })).toBeNull()
    expect(eventFromDraft('brief', { ...draft, endTime: '09:00' })).toBeNull()
    expect(
      eventFromDraft('harbor', { ...draft, allDay: true, detail: ' ', tone: 'neutral' }),
    ).toEqual({
      id: 'harbor',
      title: 'File the brief',
      start: '2026-10-23',
      end: '2026-10-23',
    })
  })
})
