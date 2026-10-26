import preview from '@sb/preview'
import { UiStamp } from '@/components/stamp'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/Stamp',
  component: UiStamp,
  args: { text: 'Filed', tone: 'success' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiStamp, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Seals"><ui-stamp text="Draft" tone="neutral" /><ui-stamp text="Filed" tone="success" /><ui-stamp text="Void" tone="danger" /></showcase-case></showcase-board>`,
  })),
)
