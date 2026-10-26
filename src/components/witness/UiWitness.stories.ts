import preview from '@sb/preview'
import { UiWitness } from '@/components/witness'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Desk/Witness',
  component: UiWitness,
  args: {
    label: 'Witness',
    statement: 'The brief reached the desk.',
    signedAt: '2026-10-23T04:00:00.000Z',
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiWitness, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Sign"><ui-witness statement="The brief reached the desk." signed-at="2026-10-23T04:00:00.000Z" /></showcase-case></showcase-board>`,
  })),
)
