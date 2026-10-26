import { ref } from 'vue'
import preview from '@sb/preview'
import { UiPopconfirm } from '@/components/popconfirm'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Overlay/Popconfirm',
  component: UiPopconfirm,
  args: { title: 'Archive this row?', confirmLabel: 'Archive', danger: true },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiPopconfirm, ShowcaseBoard, ShowcaseCase },
    setup() {
      const note = ref('Waiting')
      return { note }
    },
    template: `
      <showcase-board>
        <showcase-case title="Danger">
          <ui-popconfirm title="Archive this row?" confirm-label="Archive" danger @confirm="note = 'Archived'" />
          <p>{{ note }}</p>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
