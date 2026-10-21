import preview from '@sb/preview'
import { UiTextarea } from '@/components/textarea'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Textarea',
  component: UiTextarea,
  args: {
    placeholder: 'What should the team know?',
    rows: 4,
    autoSize: false,
    disabled: false,
    readonly: false,
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiTextarea, ShowcaseBoard, ShowcaseCase },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="Fixed rows">
        <UiTextarea placeholder="Four rows" />
      </ShowcaseCase>
      <ShowcaseCase title="Auto size" note="The field grows with its content.">
        <UiTextarea auto-size default-value="Line one&#10;Line two" />
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
