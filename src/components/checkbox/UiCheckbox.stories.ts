import preview from '@sb/preview'
import { UiCheckbox } from '@/components/checkbox'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Checkbox',
  component: UiCheckbox,
  args: {
    label: 'Send a weekly digest',
    defaultValue: false,
    disabled: false,
    indeterminate: false,
    invalid: false,
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCheckbox, ShowcaseBoard, ShowcaseCase },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="States">
        <UiCheckbox label="Off" />
        <UiCheckbox label="On" :default-value="true" />
        <UiCheckbox label="Mixed" indeterminate />
        <UiCheckbox label="Disabled" disabled />
        <UiCheckbox label="Invalid" invalid />
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
