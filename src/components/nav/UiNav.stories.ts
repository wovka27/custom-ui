import preview from '@sb/preview'
import { UiNav } from '@/components/nav'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const items = [
  { id: 'forms', label: 'Forms', href: '#forms' },
  { id: 'data', label: 'Data', href: '#data', current: true },
]

const meta = preview.meta({
  title: 'Layout/Nav',
  component: UiNav,
  args: { label: 'Sections', items },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiNav, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ items }),
    template: `<showcase-board><showcase-case title="Current page"><ui-nav label="Sections" :items="items" /></showcase-case></showcase-board>`,
  })),
)
