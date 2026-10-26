import preview from '@sb/preview'
import { UiSpark } from '@/components/spark'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/Spark',
  component: UiSpark,
  args: { label: 'Invoices', values: [2, 4, 3, 8, 6, 9] },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiSpark, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Series"><ui-spark label="Invoices" :values="[2, 4, 3, 8, 6, 9]" /></showcase-case></showcase-board>`,
  })),
)
