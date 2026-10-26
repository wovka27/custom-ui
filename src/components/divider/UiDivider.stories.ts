import preview from '@sb/preview'
import { UiDivider } from '@/components/divider'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Divider',
  component: UiDivider,
  args: { label: 'Or', orientation: 'horizontal' },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiDivider, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Label"><ui-divider>Or continue</UiDivider></showcase-case>
        <showcase-case title="Rule"><ui-divider /></showcase-case>
      </showcase-board>
    `,
  })),
)
