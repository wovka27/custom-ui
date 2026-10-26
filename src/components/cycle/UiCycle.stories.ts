import { ref } from 'vue'
import preview from '@sb/preview'
import { UiCycle } from '@/components/cycle'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const states = [
  { id: 'draft', label: 'Draft' },
  { id: 'review', label: 'Review' },
  { id: 'filed', label: 'Filed' },
]

const meta = preview.meta({
  title: 'Instruments/Cycle',
  component: UiCycle,
  args: { states, label: 'Filing state', defaultValue: 'review' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCycle, ShowcaseBoard, ShowcaseCase },
    setup() {
      const phase = ref('review')
      return { states, phase }
    },
    template: `<showcase-board><showcase-case title="States"><ui-cycle v-model="phase" :states="states" label="Filing state" /></showcase-case></showcase-board>`,
  })),
)
