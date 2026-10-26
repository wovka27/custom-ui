import preview from '@sb/preview'
import { UiCountdown } from '@/components/countdown'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const endsAt = Date.now() + 90_000

const meta = preview.meta({
  title: 'Data/Countdown',
  component: UiCountdown,
  args: { endsAt, label: 'Filing window' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiCountdown, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ endsAt }),
    template: `
      <showcase-board>
        <showcase-case title="Window"><ui-countdown :ends-at="endsAt" label="Filing window" /></showcase-case>
      </showcase-board>
    `,
  })),
)
