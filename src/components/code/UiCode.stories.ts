import preview from '@sb/preview'
import { UiCode } from '@/components/code'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Utilities/Code',
  component: UiCode,
  args: { code: 'npm install custom-ui', block: false },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCode, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Inline">Install <ui-code code="custom-ui" />.</showcase-case>
        <showcase-case title="Block"><ui-code block code="import { UiButton } from 'custom-ui'" /></showcase-case>
      </showcase-board>
    `,
  })),
)
