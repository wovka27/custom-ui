import { ref } from 'vue'
import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiSlider } from '@/components/slider'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Slider',
  component: UiSlider,
  args: { defaultValue: 32, min: 0, max: 100, step: 1, label: 'Volume', range: false },
  argTypes: { modelValue: { control: false }, range: { control: 'boolean' } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiSlider, UiButton, ShowcaseBoard, ShowcaseCase },
    setup: () => {
      const min = ref(0)
      const max = ref(100)
      const tight = ref(false)
      function toggleScale(): void {
        tight.value = !tight.value
        min.value = tight.value ? 20 : 0
        max.value = tight.value ? 80 : 100
      }
      return { min, max, tight, toggleScale }
    },
    template: `
      <showcase-board>
        <showcase-case title="Value"><ui-slider :default-value="40" label="Volume" /></showcase-case>
        <showcase-case title="Step"><ui-slider :default-value="0.5" :min="0" :max="1" :step="0.1" label="Opacity" /></showcase-case>
        <showcase-case title="Two anchors" note="A thumb can pass through the other. The scale can change underneath them.">
          <ui-slider range :default-value="[24, 70]" :min="min" :max="max" label="Window" />
          <ui-button size="sm" variant="secondary" @click="toggleScale">
            {{ tight ? 'Restore the scale' : 'Tighten the scale' }}
          </ui-button>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
