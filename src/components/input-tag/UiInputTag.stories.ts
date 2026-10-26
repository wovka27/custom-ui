import preview from '@sb/preview'
import { UiInputTag } from '@/components/input-tag'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Input tag',
  component: UiInputTag,
  args: { placeholder: 'Add a tag', defaultValue: ['design', 'kit'] },
  argTypes: { modelValue: { control: false } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiInputTag, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Tags" note="Enter or comma commits. Backspace removes the last tag.">
          <ui-input-tag :default-value="['Ada']" placeholder="Name" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
