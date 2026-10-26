import preview from '@sb/preview'
import { UiDateTimePicker } from '@/components/date-time-picker'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Date time picker',
  component: UiDateTimePicker,
  args: { placeholder: 'Choose a date and time', weekStartsOn: 1 },
  argTypes: {
    weekStartsOn: { control: 'inline-radio', options: [0, 1] },
    modelValue: { control: false },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiDateTimePicker, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Date and time">
          <ui-date-time-picker default-value="2026-10-21T09:30" />
        </showcase-case>
        <showcase-case title="Range" note="Start and end each keep a time.">
          <ui-date-time-picker range placeholder="Start and end" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
