import preview from '@sb/preview'
import { UiTimeField } from '@/components/time-field'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Time field',
  component: UiTimeField,
  args: { label: 'Call time', defaultValue: '09:30' },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiTimeField, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Window"><ui-time-field label="Call time" default-value="09:30" min="08:00" max="18:00" /></showcase-case></showcase-board>`,
  })),
)
