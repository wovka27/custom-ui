import { ref } from 'vue'
import preview from '@sb/preview'
import { UiRate } from '@/components/rate'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Rate',
  component: UiRate,
  args: { label: 'Satisfaction', max: 5, defaultValue: 3 },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiRate, ShowcaseBoard, ShowcaseCase },
    setup() {
      const score = ref(4)
      return { score }
    },
    template: `
      <showcase-board>
        <showcase-case title="Editable"><ui-rate v-model="score" label="Satisfaction" /></showcase-case>
        <showcase-case title="Read only"><ui-rate :model-value="4" readonly label="Satisfaction" /></showcase-case>
      </showcase-board>
    `,
  })),
)
