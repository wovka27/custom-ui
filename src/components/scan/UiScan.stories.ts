import preview from '@sb/preview'
import { UiScan } from '@/components/scan'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/Scan',
  component: UiScan,
  args: { active: true, label: 'Reading the brief', default: 'North dock, three berths.' },
  argTypes: { default: { control: 'text', name: 'Copy' } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiScan, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Reading"><ui-scan active label="Reading the brief">North dock, three berths.</ui-scan></showcase-case></showcase-board>`,
  })),
)
