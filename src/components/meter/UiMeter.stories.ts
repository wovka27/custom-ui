import preview from '@sb/preview'
import { UiMeter } from '@/components/meter'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Meter',
  component: UiMeter,
  args: { label: 'Capacity', value: 64, min: 0, max: 100, low: 20, high: 80, optimum: 60 },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiMeter, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Capacity"><ui-meter label="Capacity" :value="64" :low="20" :high="80" :optimum="60" /></showcase-case></showcase-board>`,
  })),
)
