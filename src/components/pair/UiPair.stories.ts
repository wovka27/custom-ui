import { ref } from 'vue'
import preview from '@sb/preview'
import { UiPair } from '@/components/pair'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/Pair',
  component: UiPair,
  args: { label: 'Berth range', min: 0, max: 12, defaultValue: { start: 2, end: 8 } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiPair, ShowcaseBoard, ShowcaseCase },
    setup() {
      const pair = ref({ start: 2, end: 8 })
      return { pair }
    },
    template: `<showcase-board><showcase-case title="Ordered ends"><ui-pair v-model="pair" label="Berth range" :min="0" :max="12" /></showcase-case></showcase-board>`,
  })),
)
