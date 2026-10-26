import preview from '@sb/preview'
import { UiRedact } from '@/components/redact'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Desk/Redact',
  component: UiRedact,
  args: { label: 'Account', value: 'GB29 NWBK 6016 1331 9268 19', defaultValue: false },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiRedact, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Account"><ui-redact label="Account" value="GB29 NWBK 6016 1331 9268 19" /></showcase-case></showcase-board>`,
  })),
)
