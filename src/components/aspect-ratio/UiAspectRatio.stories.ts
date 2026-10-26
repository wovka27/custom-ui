import preview from '@sb/preview'
import { UiAspectRatio } from '@/components/aspect-ratio'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Aspect ratio',
  component: UiAspectRatio,
  args: { ratio: '16 / 9' },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiAspectRatio },
      setup: () => ({ args }),
      template: `<ui-aspect-ratio v-bind="args" />`,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiAspectRatio, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="16:9"><ui-aspect-ratio ratio="16 / 9" /></showcase-case></showcase-board>`,
  })),
)
