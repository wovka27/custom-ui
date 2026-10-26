import preview from '@sb/preview'
import { UiWhisper } from '@/components/whisper'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/Whisper',
  component: UiWhisper,
  args: { default: 'berth', note: 'A berth is one mooring on the dock.' },
  argTypes: { default: { control: 'text', name: 'Word' } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiWhisper, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Note"><p>The <ui-whisper note="A berth is one mooring on the dock.">berth</UiWhisper> is open.</p></showcase-case></showcase-board>`,
  })),
)
