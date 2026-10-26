import preview from '@sb/preview'
import { UiLink } from '@/components/link'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Utilities/Link',
  component: UiLink,
  args: { href: '#invoices', default: 'Open invoices', external: false },
  argTypes: { default: { control: 'text', name: 'Label' } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiLink, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="External"><ui-link href="https://example.com" external>Example</UiLink></showcase-case>
      </showcase-board>
    `,
  })),
)
