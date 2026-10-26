import preview from '@sb/preview'
import { UiCompare } from '@/components/compare'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/Compare',
  component: UiCompare,
  args: { label: 'Draft against filed', defaultValue: 40 },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiCompare },
      setup: () => ({ args }),
      template: `<ui-compare v-bind="args"><template #before>Draft</template><template #after>Filed</template></ui-compare>`,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCompare, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Layers"><ui-compare label="Draft against filed"><template #before>Draft</template><template #after>Filed</template></ui-compare></showcase-case></showcase-board>`,
  })),
)
