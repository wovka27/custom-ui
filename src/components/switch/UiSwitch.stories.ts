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
    <ShowcaseBoard>
      <ShowcaseCase title="States">
        <UiSwitch label="Off" />
        <UiSwitch label="On" :default-value="true" />
        <UiSwitch label="Disabled" disabled />
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
