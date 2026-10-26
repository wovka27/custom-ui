import preview from '@sb/preview'
import { UiScrollArea } from '@/components/scroll-area'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Scroll area',
  component: UiScrollArea,
  args: { label: 'Notes', maxHeight: '8rem' },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiScrollArea },
      setup: () => ({ args }),
      template: `<ui-scroll-area v-bind="args"><p v-for="n in 12" :key="n">Note {{ n }}</p></ui-scroll-area>`,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiScrollArea, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Bounded">
          <ui-scroll-area label="Notes" max-height="8rem"><p v-for="n in 12" :key="n">Note {{ n }}</p></ui-scroll-area>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
