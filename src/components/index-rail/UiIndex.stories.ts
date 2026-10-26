import preview from '@sb/preview'
import { UiIndex } from '@/components/index-rail'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const items = [
  { id: 'ada', label: 'Ada Lovelace' },
  { id: 'alan', label: 'Alan Turing' },
  { id: 'grace', label: 'Grace Hopper' },
]

const meta = preview.meta({
  title: 'Instruments/Index',
  component: UiIndex,
  args: { items, label: 'People' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiIndex, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ items }),
    template: `<showcase-board><showcase-case title="Letters"><ui-index :items="items" label="People" /></showcase-case></showcase-board>`,
  })),
)
