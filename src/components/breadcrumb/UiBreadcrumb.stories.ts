import preview from '@sb/preview'
import { UiBreadcrumb } from '@/components/breadcrumb'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const trail = [
  { id: 'kit', label: 'Custom UI', href: '#forms' },
  { id: 'data', label: 'Invoices' },
] as const

const meta = preview.meta({
  title: 'Navigation/Breadcrumb',
  component: UiBreadcrumb,
  args: {
    label: 'Breadcrumb',
    items: trail,
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiBreadcrumb, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ trail }),
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="Current page">
        <UiBreadcrumb :items="trail" />
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
