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
      <ShowcaseBoard>
        <ShowcaseCase title="Panel">
          <UiColorPicker default-value="#3f9d6a" />
        </ShowcaseCase>
        <ShowcaseCase title="Inline">
          <UiColorPicker variant="inline" default-value="#d2a04a" />
        </ShowcaseCase>
        <ShowcaseCase title="Swatches">
          <UiColorPicker variant="swatches" default-value="#5aa8ff" />
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
