import { ref } from 'vue'
import preview from '@sb/preview'
import { UiMenu } from '@/components/menu'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const items = [
  { id: 'edit', label: 'Edit', hint: 'E' },
  { id: 'archive', label: 'Archive', danger: true },
  { id: 'locked', label: 'Delete', disabled: true },
]

const meta = preview.meta({
  title: 'Overlay/Menu',
  component: UiMenu,
  args: { label: 'Row actions', items },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiMenu, ShowcaseBoard, ShowcaseCase },
    setup() {
      const picked = ref('None')
      return { items, picked }
    },
    template: `
      <showcase-board>
        <showcase-case title="Actions">
          <ui-menu :items="items" label="Row actions" @select="picked = $event.label" />
          <p>{{ picked }}</p>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
