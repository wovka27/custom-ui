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
    <ShowcaseBoard>
      <ShowcaseCase title="Tones">
        <UiBadge>Neutral</UiBadge>
        <UiBadge tone="accent">Accent</UiBadge>
        <UiBadge tone="success">Paid</UiBadge>
        <UiBadge tone="warning">Review</UiBadge>
        <UiBadge tone="danger">Overdue</UiBadge>
        <UiBadge tone="info">Open</UiBadge>
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
