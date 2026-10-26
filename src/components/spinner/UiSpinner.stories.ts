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
    <showcase-board>
      <showcase-case title="Status" note="Announces Loading to assistive tech.">
        <ui-spinner />
      </showcase-case>
      <showcase-case title="Decorative" note="Hidden from the accessibility tree.">
        <ui-spinner decorative />
      </showcase-case>
    </showcase-board>
  `,
  })),
)
