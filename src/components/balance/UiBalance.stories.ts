import preview from '@sb/preview'
import { UiBalance } from '@/components/balance'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/Balance',
  component: UiBalance,
  args: { start: 18, end: 6, startLabel: 'Open', endLabel: 'Closed' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiBalance, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Split"><ui-balance :start="18" :end="6" start-label="Open" end-label="Closed" /></showcase-case></showcase-board>`,
  })),
)
