import preview from '@sb/preview'
import { UiSpinner } from '@/components/spinner'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Spinner',
  component: UiSpinner,
  args: {
    label: 'Loading',
    decorative: false,
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiSpinner, ShowcaseBoard, ShowcaseCase },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="Status" note="Announces Loading to assistive tech.">
        <UiSpinner />
      </ShowcaseCase>
      <ShowcaseCase title="Decorative" note="Hidden from the accessibility tree.">
        <UiSpinner decorative />
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
