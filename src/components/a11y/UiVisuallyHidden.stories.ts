import preview from '@sb/preview'
import { UiVisuallyHidden } from '@/components/a11y'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Utilities/Visually hidden',
  component: UiVisuallyHidden,
  args: {
    default: 'Skip to content',
  },
  argTypes: {
    default: { control: 'text', name: 'Text' },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiVisuallyHidden, ShowcaseBoard, ShowcaseCase },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="Screen reader only" note="The name is in the accessibility tree and not on screen.">
        <button type="button">
          Menu
          <UiVisuallyHidden>Open navigation</UiVisuallyHidden>
        </button>
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
