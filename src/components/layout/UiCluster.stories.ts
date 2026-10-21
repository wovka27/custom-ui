import preview from '@sb/preview'
import { UiCluster } from '@/components/layout'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Cluster',
  component: UiCluster,
  args: {
    gap: 'sm',
    justify: 'start',
  },
  argTypes: {
    gap: { control: 'inline-radio', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    justify: { control: 'inline-radio', options: ['start', 'center', 'end', 'between'] },
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiCluster },
      setup: () => ({ args }),
      template: `
      <UiCluster v-bind="args" style="width: 24rem">
        <span>Northwind</span><span>Harbor</span><span>Lumen</span><span>Cedar</span>
      </UiCluster>
    `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCluster, ShowcaseBoard, ShowcaseCase },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="Space between">
        <UiCluster justify="between" style="width: 24rem"><span>Selected</span><span>4 pages</span></UiCluster>
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
