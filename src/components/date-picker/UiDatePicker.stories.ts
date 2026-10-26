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
      <showcase-board>
        <showcase-case title="Single date" note="Header, day, footer, and trigger are slots.">
          <ui-date-picker default-value="2026-10-21" />
        </showcase-case>
        <showcase-case title="Bounded">
          <ui-date-picker min="2026-10-01" max="2026-10-31" placeholder="October only" />
        </showcase-case>
        <showcase-case title="Range" note="The first day is the start. The second day is the end.">
          <ui-date-picker range default-value="2026-10-12" placeholder="Start and end" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
