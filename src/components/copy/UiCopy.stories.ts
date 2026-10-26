import preview from '@sb/preview'
import { UiCopy } from '@/components/copy'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Copy',
  component: UiCopy,
  args: { value: 'INV-1042', label: 'Copy reference' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCopy, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Reference"><ui-copy value="INV-1042" label="Copy reference" /></showcase-case>
      </showcase-board>
    `,
  })),
)
