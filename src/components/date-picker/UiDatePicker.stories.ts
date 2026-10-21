import preview from '@sb/preview'
import { UiDatePicker } from '@/components/date-picker'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Date picker',
  component: UiDatePicker,
  args: { placeholder: 'Choose a date', weekStartsOn: 1 },
  argTypes: {
    weekStartsOn: { control: 'inline-radio', options: [0, 1] },
    modelValue: { control: false },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiDatePicker, ShowcaseBoard, ShowcaseCase },
    template: `
      <ShowcaseBoard>
        <ShowcaseCase title="Single date" note="Header, day, footer, and trigger are slots.">
          <UiDatePicker default-value="2026-10-21" />
        </ShowcaseCase>
        <ShowcaseCase title="Bounded">
          <UiDatePicker min="2026-10-01" max="2026-10-31" placeholder="October only" />
        </ShowcaseCase>
        <ShowcaseCase title="Range" note="The first day is the start. The second day is the end.">
          <UiDatePicker range default-value="2026-10-12" placeholder="Start and end" />
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
