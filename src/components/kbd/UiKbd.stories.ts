import preview from '@sb/preview'
import { UiKbd } from '@/components/kbd'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Utilities/Kbd',
  component: UiKbd,
  args: { default: 'Ctrl' },
  argTypes: { default: { control: 'text', name: 'Key' } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiKbd, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Chord"><ui-kbd>Ctrl</UiKbd><ui-kbd>K</UiKbd></showcase-case>
      </showcase-board>
    `,
  })),
)
