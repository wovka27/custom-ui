import preview from '@sb/preview'
import { UiText } from '@/components/text'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Utilities/Text',
  component: UiText,
  args: { default: 'Filed this week.', size: 'md', tone: 'default', as: 'p' },
  argTypes: {
    default: { control: 'text', name: 'Copy' },
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    tone: { control: 'inline-radio', options: ['default', 'muted'] },
    as: { control: 'inline-radio', options: ['p', 'span', 'h1', 'h2', 'h3', 'h4', 'small'] },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiText, ShowcaseBoard, ShowcaseCase },
    template: `<showcase-board><showcase-case title="Muted"><ui-text tone="muted" size="sm">Secondary copy.</ui-text></showcase-case></showcase-board>`,
  })),
)
