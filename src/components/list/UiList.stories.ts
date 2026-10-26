import preview from '@sb/preview'
import { UiList } from '@/components/list'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const items = ['Draft', 'Review', 'File']

const meta = preview.meta({
  title: 'Utilities/List',
  component: UiList,
  args: { items, ordered: false, label: 'Steps' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiList, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ items }),
    template: `<showcase-board><showcase-case title="Ordered"><ui-list ordered :items="items" label="Steps" /></showcase-case></showcase-board>`,
  })),
)
