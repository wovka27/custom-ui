import { ref } from 'vue'
import preview from '@sb/preview'
import { UiNumberField } from '@/components/number-field'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Number field',
  component: UiNumberField,
  args: { label: 'Quantity', min: 0, max: 12, step: 1, defaultValue: 2 },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiNumberField, ShowcaseBoard, ShowcaseCase },
    setup() {
      const qty = ref(2)
      return { qty }
    },
    template: `
      <showcase-board>
        <showcase-case title="Range">
          <ui-number-field v-model="qty" label="Quantity" :min="0" :max="12">
            <template #suffix>units</template>
          </ui-number-field>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
