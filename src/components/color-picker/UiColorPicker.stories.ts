import preview from '@sb/preview'
import { UiColorPicker } from '@/components/color-picker'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Color picker',
  component: UiColorPicker,
  args: { defaultValue: '#5aa8ff' },
  argTypes: { modelValue: { control: false } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiColorPicker, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Panel">
          <ui-color-picker default-value="#3f9d6a" />
        </showcase-case>
        <showcase-case title="Inline">
          <ui-color-picker variant="inline" default-value="#d2a04a" />
        </showcase-case>
        <showcase-case title="Swatches">
          <ui-color-picker variant="swatches" default-value="#5aa8ff" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
