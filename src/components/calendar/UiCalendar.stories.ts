import preview from '@sb/preview'
import { UiCalendar, type CalendarEvent } from '@/components/calendar'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const events: CalendarEvent[] = [
  { id: 'harbor', title: 'Harbor call', start: '2026-10-21', end: '2026-10-22', tone: 'warning' },
  {
    id: 'tide',
    title: 'Tide watch',
    start: '2026-10-23T06:40',
    end: '2026-10-23T07:10',
    tone: 'accent',
  },
  { id: 'berth', title: 'Berth check', start: '2026-10-23T07:00', end: '2026-10-23T08:00' },
  {
    id: 'brief',
    title: 'File the brief',
    start: '2026-10-23T09:30',
    end: '2026-10-23T10:00',
    tone: 'success',
    detail: 'It has a second pair of eyes.',
  },
  { id: 'count', title: 'Count the crates', start: '2026-10-24T14:00', end: '2026-10-24T15:00' },
]

const meta = preview.meta({
  title: 'Controls/Calendar',
  component: UiCalendar,
  args: { label: 'Desk', defaultValue: '2026-10-23', events },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCalendar, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ events }),
    template: `<showcase-board>
      <showcase-case title="Month"><ui-calendar label="Desk" default-value="2026-10-23" :events="events" /></showcase-case>
      <showcase-case title="Week"><ui-calendar label="Desk" default-value="2026-10-23" default-view="week" :events="events" /></showcase-case>
    </showcase-board>`,
  })),
)
