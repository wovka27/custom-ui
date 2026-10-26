import preview from '@sb/preview'
import { UiSeparator } from '@/components/layout'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Separator',
  component: UiSeparator,
  args: {
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiSeparator },
      setup: () => ({ args }),
      template: `
      <div :style="args.orientation === 'vertical' ? 'display:flex;height:4rem' : 'width:16rem'">
        <ui-separator :orientation="args.orientation" />
      </div>
    `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiSeparator, ShowcaseBoard, ShowcaseCase },
    template: `
    <showcase-board>
      <showcase-case title="Horizontal">
        <div style="width: 16rem"><ui-separator /></div>
      </showcase-case>
      <showcase-case title="Vertical">
        <div style="display: flex; height: 4rem"><ui-separator orientation="vertical" /></div>
      </showcase-case>
    </showcase-board>
  `,
  })),
)
