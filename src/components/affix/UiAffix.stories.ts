import preview from '@sb/preview'
import { UiAffix } from '@/components/affix'
import { UiButton } from '@/components/button'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Affix',
  component: UiAffix,
  args: { offset: 8 },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiAffix, UiButton },
      setup: () => ({ args }),
      template: `<ui-affix v-bind="args"><ui-button size="sm">Pinned action</UiButton></ui-affix>`,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiAffix, UiButton, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Offset"><ui-affix :offset="8"><ui-button size="sm">Pinned action</UiButton></ui-affix></showcase-case></showcase-board>`,
  })),
)
