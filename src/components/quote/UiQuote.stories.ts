import preview from '@sb/preview'
import { UiQuote } from '@/components/quote'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Utilities/Quote',
  component: UiQuote,
  args: { default: 'Three berths are open tonight.', cite: 'North dock' },
  argTypes: { default: { control: 'text', name: 'Quote' } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiQuote, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Cited"><ui-quote cite="North dock">Three berths are open tonight.</ui-quote></showcase-case></showcase-board>`,
  })),
)
