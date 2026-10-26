import preview from '@sb/preview'
import { UiBadge } from '@/components/badge'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Badge',
  component: UiBadge,
  args: {
    default: 'Paid',
    tone: 'success',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'],
    },
    default: { control: 'text', name: 'Label' },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiBadge, ShowcaseBoard, ShowcaseCase },
    template: `
    <showcase-board>
      <showcase-case title="Tones">
        <ui-badge>Neutral</UiBadge>
        <ui-badge tone="accent">Accent</UiBadge>
        <ui-badge tone="success">Paid</UiBadge>
        <ui-badge tone="warning">Review</UiBadge>
        <ui-badge tone="danger">Overdue</UiBadge>
        <ui-badge tone="info">Open</UiBadge>
      </showcase-case>
    </showcase-board>
  `,
  })),
)
