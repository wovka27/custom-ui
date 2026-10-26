import preview from '@sb/preview'
import { UiContainer } from '@/components/layout'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Container',
  component: UiContainer,
  args: {
    width: '32rem',
    default: 'Content stays inside the measure.',
  },
  argTypes: {
    default: { control: 'text', name: 'Content' },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiContainer, ShowcaseBoard, ShowcaseCase },
    template: `
    <showcase-board>
      <showcase-case title="Measure">
        <ui-container width="28rem">Content stays inside the measure.</ui-container>
      </showcase-case>
    </showcase-board>
  `,
  })),
)
