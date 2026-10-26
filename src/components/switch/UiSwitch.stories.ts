import preview from '@sb/preview'
import { UiSwitch } from '@/components/switch'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Switch',
  component: UiSwitch,
  args: {
    label: 'Send a weekly digest',
    defaultValue: true,
    disabled: false,
    size: 'md',
  },
  argTypes: {
    modelValue: { control: false },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiSwitch, ShowcaseBoard, ShowcaseCase },
    template: `
    <showcase-board>
      <showcase-case title="States">
        <ui-switch label="Off" />
        <ui-switch label="On" :default-value="true" />
        <ui-switch label="Disabled" disabled />
      </showcase-case>
    </showcase-board>
  `,
  })),
)
