import preview from '@sb/preview'
import { UiSteps } from '@/components/steps'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const items = [
  { id: 'draft', title: 'Draft', description: 'Write the brief' },
  { id: 'review', title: 'Review', description: 'A second pair of eyes' },
  { id: 'file', title: 'File', description: 'Send it out' },
]

const meta = preview.meta({
  title: 'Data/Steps',
  component: UiSteps,
  args: { items, current: 1 },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiSteps, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ items }),
    template: `
      <showcase-board>
        <showcase-case title="Current"><ui-steps :items="items" :current="1" /></showcase-case>
      </showcase-board>
    `,
  })),
)
