import preview from '@sb/preview'
import { UiStatus } from '@/components/status'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Status',
  component: UiStatus,
  args: { label: 'Live', tone: 'success', pulse: true },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'],
    },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiStatus, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Tones">
          <ui-status label="Live" tone="success" pulse />
          <ui-status label="Review" tone="warning" />
          <ui-status label="Down" tone="danger" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
