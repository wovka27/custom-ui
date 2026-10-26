import preview from '@sb/preview'
import { UiBorderBeam } from '@/components/border-beam'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Instruments/BorderBeam',
  component: UiBorderBeam,
  args: {
    tone: 'accent',
    duration: 6,
    delay: 0,
    size: 120,
    width: 2,
    reverse: false,
    mirror: false,
    glow: false,
    active: true,
    default: 'The brief stays inside the frame.',
  },
  argTypes: { default: { control: 'text', name: 'Copy' } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiBorderBeam, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Walking the edge">
          <ui-border-beam>The brief stays inside the frame.</ui-border-beam>
        </showcase-case>
        <showcase-case title="Reverse">
          <ui-border-beam reverse tone="info">The light returns the other way.</ui-border-beam>
        </showcase-case>
        <showcase-case title="Two beams">
          <ui-border-beam mirror :duration="8">A second light follows half a lap behind.</ui-border-beam>
        </showcase-case>
        <showcase-case title="Glow">
          <ui-border-beam glow :radius="18">A soft light sits behind the stroke.</ui-border-beam>
        </showcase-case>
        <showcase-case title="Around the corner">
          <ui-border-beam :radius="20" :size="80">The light bends with the corner.</ui-border-beam>
        </showcase-case>
        <showcase-case title="Still">
          <ui-border-beam :active="false" tone="neutral">Motion is off. The mark stays put.</ui-border-beam>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
