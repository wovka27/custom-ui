import preview from '@sb/preview'
import { UiText } from '@/components/text'
import { UiWatermark } from '@/components/watermark'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Utilities/Watermark',
  component: UiWatermark,
  args: { text: 'Draft' },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiText, UiWatermark },
      setup: () => ({ args }),
      template: `<ui-watermark v-bind="args"><ui-text>The brief stays readable under the mark.</ui-text></ui-watermark>`,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiText, UiWatermark, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Draft"><ui-watermark text="Draft"><ui-text>The brief stays readable under the mark.</ui-text></ui-watermark></showcase-case></showcase-board>`,
  })),
)
