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
    <showcase-board>
      <showcase-case title="States">
        <ui-checkbox label="Off" />
        <ui-checkbox label="On" :default-value="true" />
        <ui-checkbox label="Mixed" indeterminate />
        <ui-checkbox label="Disabled" disabled />
        <ui-checkbox label="Invalid" invalid />
      </showcase-case>
    </showcase-board>
  `,
  })),
)
