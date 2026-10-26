import preview from '@sb/preview'
import { UiTimeline } from '@/components/timeline'
import type { UiTimelineItem } from '@/components/timeline'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const items: readonly UiTimelineItem[] = [
  { id: 'filed', time: '09:10', title: 'Filed', description: 'The brief reached the desk.' },
  { id: 'review', time: '11:40', title: 'Review', description: 'Ada marked two lines.' },
  { id: 'sent', time: '16:05', title: 'Sent', description: 'The client received the proof.' },
]

const meta = preview.meta({
  title: 'Data/Timeline',
  component: UiTimeline,
  args: { items, label: 'Desk day' },
  argTypes: { items: { control: false } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiTimeline, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ items }),
    template: `
      <showcase-board>
        <showcase-case title="Day">
          <ui-timeline :items="items" label="Desk day" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
