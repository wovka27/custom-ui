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
      <ShowcaseBoard>
        <ShowcaseCase title="Value"><UiSlider :default-value="40" label="Volume" /></ShowcaseCase>
        <ShowcaseCase title="Step"><UiSlider :default-value="0.5" :min="0" :max="1" :step="0.1" label="Opacity" /></ShowcaseCase>
        <ShowcaseCase title="Two anchors" note="Each thumb moves its own end. The scale can change underneath them.">
          <UiSlider range :default-value="[24, 70]" :min="min" :max="max" label="Window" />
          <UiButton size="sm" variant="secondary" @click="toggleScale">
            {{ tight ? 'Restore the scale' : 'Tighten the scale' }}
          </UiButton>
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
