import preview from '@sb/preview'
import { UiGrid } from '@/components/layout'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Grid',
  component: UiGrid,
  args: {
    gap: 'md',
    minColumn: '12rem',
  },
  argTypes: {
    gap: { control: 'inline-radio', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiGrid },
      setup: () => ({ args }),
      template: `
      <ui-grid v-bind="args" style="width: min(40rem, 80vw)">
        <span>Stack</span><span>Cluster</span><span>Grid</span>
      </ui-grid>
    `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiGrid, ShowcaseBoard, ShowcaseCase },
    template: `
    <showcase-board>
      <showcase-case title="Intrinsic columns">
        <ui-grid min-column="10rem" style="width: min(40rem, 80vw)">
          <span>One</span><span>Two</span><span>Three</span><span>Four</span>
        </ui-grid>
      </showcase-case>
    </showcase-board>
  `,
  })),
)
