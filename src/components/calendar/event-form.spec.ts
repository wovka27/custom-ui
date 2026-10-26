import { describe, expect, it } from 'vitest'
import { createEventValues, editEventValues, eventFromForm } from './event-form'

describe('event form', () => {
  it('turns a saved form into an event and rejects a backwards end', () => {
    const created = createEventValues('2026-10-23', '12:00')
    expect(created.startAt).toBe('2026-10-23T12:00')
    expect(created.endAt).toBe('2026-10-23T12:30')
    const saved = eventFromForm('n1', { ...created, title: ' New watch ' })
    expect(saved).toEqual({
      id: 'n1',
      title: 'New watch',
      tone: 'accent',
      start: '2026-10-23T12:00',
      end: '2026-10-23T12:30',
    })
    expect(
      eventFromForm('n1', { ...created, title: 'New watch', endAt: '2026-10-23T11:00' }),
    ).toBeNull()
  })

  it('loads an existing event into the form fields', () => {
    expect(
      editEventValues({
        id: 'harbor',
        title: 'Harbor call',
        start: '2026-10-21',
        end: '2026-10-22',
        tone: 'warning',
        detail: 'Ask which berth is free.',
      }),
    ).toMatchObject({
      title: 'Harbor call',
      allDay: true,
      startDay: '2026-10-21',
      endDay: '2026-10-22',
      tone: 'warning',
    })
  })
})
