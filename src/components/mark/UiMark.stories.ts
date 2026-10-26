import preview from '@sb/preview'
import { UiMark } from '@/components/mark'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/Mark',
  component: UiMark,
  args: { default: 'open tonight', tone: 'accent' },
  argTypes: {
    default: { control: 'text', name: 'Phrase' },
    tone: { control: 'inline-radio', options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiMark, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Phrase"><p>The berth is <ui-mark>open tonight</UiMark>.</p></showcase-case></showcase-board>`,
  })),
)
