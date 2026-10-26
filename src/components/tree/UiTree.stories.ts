import { ref } from 'vue'
import preview from '@sb/preview'
import { UiTree } from '@/components/tree'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const nodes = [
  {
    id: 'desk',
    label: 'Desk',
    children: [
      { id: 'invoices', label: 'Invoices' },
      { id: 'briefs', label: 'Briefs', disabled: true },
    ],
  },
  { id: 'archive', label: 'Archive' },
]

const meta = preview.meta({
  title: 'Data/Tree',
  component: UiTree,
  args: { nodes, label: 'Files', defaultExpanded: ['desk'] },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiTree, ShowcaseBoard, ShowcaseCase },
    setup() {
      const selected = ref<string | null>('invoices')
      return { nodes, selected }
    },
    template: `
      <showcase-board>
        <showcase-case title="Files">
          <ui-tree v-model:selected="selected" :nodes="nodes" label="Files" :default-expanded="['desk']" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
