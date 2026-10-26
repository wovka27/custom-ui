import preview from '@sb/preview'
import { UiBackTop } from '@/components/back-top'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Back top',
  component: UiBackTop,
  args: { threshold: 0, label: 'Back to top' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiBackTop, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Always in this frame" note="Threshold 0 keeps the control visible.">
          <ui-back-top :threshold="0" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
