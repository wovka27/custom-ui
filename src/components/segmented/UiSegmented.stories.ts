import preview from '@sb/preview'
import { UiSegmented } from '@/components/segmented'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const modes = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

const meta = preview.meta({
  title: 'Controls/Segmented',
  component: UiSegmented,
  args: { options: modes, defaultValue: 'week', label: 'Range' },
  argTypes: { modelValue: { control: false } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiSegmented, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ modes }),
    template: `
      <ShowcaseBoard>
        <ShowcaseCase title="Single choice">
          <UiSegmented :options="modes" default-value="day" label="Range" />
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
