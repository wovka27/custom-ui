import preview from '@sb/preview'
import { UiDescription } from '@/components/description'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const items = [
  { term: 'Client', detail: 'North dock' },
  { term: 'Status', detail: 'Filed' },
]

const meta = preview.meta({
  title: 'Data/Description',
  component: UiDescription,
  args: { items, label: 'Invoice' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiDescription, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ items }),
    template: `
      <showcase-board>
        <showcase-case title="Rows"><ui-description :items="items" label="Invoice" /></showcase-case>
      </showcase-board>
    `,
  })),
)
