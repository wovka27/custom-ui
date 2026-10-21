import preview from '@sb/preview'
import { UiStack } from '@/components/layout'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Stack',
  component: UiStack,
  args: {
    gap: 'md',
    align: 'stretch',
    default: 'One\nTwo\nThree',
  },
  argTypes: {
    gap: { control: 'inline-radio', options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end', 'stretch'] },
    default: { control: 'text', name: 'Items' },
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiStack },
      setup() {
        const lines = () => String(args.default ?? '').split('\n')
        return { args, lines }
      },
      template: `
      <UiStack :gap="args.gap" :align="args.align">
        <span v-for="item in lines()" :key="item">{{ item }}</span>
      </UiStack>
    `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiStack, ShowcaseBoard, ShowcaseCase },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="Gap scale">
        <UiStack gap="sm"><span>First</span><span>Second</span><span>Third</span></UiStack>
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
