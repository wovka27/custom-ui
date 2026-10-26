import preview from '@sb/preview'
import { UiTabs } from '@/components/tabs'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const tabs = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'motion', label: 'Motion' },
  { id: 'legacy', label: 'Legacy', disabled: true },
] as const

const meta = preview.meta({
  title: 'Navigation/Tabs',
  component: UiTabs,
  args: {
    label: 'Topics',
    tabs,
    defaultValue: 'tokens',
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
})

const panels = `
  <template #tokens>Color, space, type, and focus hang off CSS variables.</template>
  <template #motion>Motion is short and disabled when the user prefers reduced motion.</template>
  <template #legacy>This panel stays unavailable.</template>
`

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiTabs },
      setup: () => ({ args }),
      template: `<ui-tabs v-bind="args">${panels}</ui-tabs>`,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiTabs, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ tabs }),
    template: `
    <showcase-board>
      <showcase-case title="Horizontal">
        <ui-tabs label="Topics" :tabs="tabs" default-value="tokens">${panels}</ui-tabs>
      </showcase-case>
      <showcase-case title="Vertical">
        <ui-tabs label="Topics" :tabs="tabs" orientation="vertical" default-value="motion">${panels}</ui-tabs>
      </showcase-case>
    </showcase-board>
  `,
  })),
)
