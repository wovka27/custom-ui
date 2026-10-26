import { ref } from 'vue'
import preview from '@sb/preview'
import { UiChip } from '@/components/chip'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Chip',
  component: UiChip,
  args: { label: 'Paid', tone: 'success' },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'],
    },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiChip, ShowcaseBoard, ShowcaseCase },
    setup() {
      const gone = ref(false)
      return { gone }
    },
    template: `
      <showcase-board>
        <showcase-case title="Selected and removable">
          <ui-chip v-if="!gone" label="This week" default-selected removable @remove="gone = true" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
