import preview from '@sb/preview'
import { UiCloseButton } from '@/components/close'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Close button',
  component: UiCloseButton,
  args: { label: 'Close' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCloseButton, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Dismiss"><ui-close-button label="Close" /></showcase-case>
      </showcase-board>
    `,
  })),
)
