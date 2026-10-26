import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiCard } from '@/components/card'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Card',
  component: UiCard,
  args: { title: 'North dock', description: 'Three berths are open tonight.' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiButton, UiCard, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Actions">
          <ui-card title="North dock" description="Three berths are open tonight.">
            <template #actions><ui-button size="sm">Assign</UiButton></template>
          </ui-card>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
