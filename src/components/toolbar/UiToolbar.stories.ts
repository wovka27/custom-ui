import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiToolbar } from '@/components/toolbar'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Layout/Toolbar',
  component: UiToolbar,
  args: { label: 'Invoice tools' },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiButton, UiToolbar },
      setup: () => ({ args }),
      template: `
        <ui-toolbar v-bind="args">
          <ui-button size="sm" variant="secondary">Filter</UiButton>
          <template #end><ui-button size="sm">Export</UiButton></template>
        </ui-toolbar>
      `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiButton, UiToolbar, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Split">
          <ui-toolbar label="Invoice tools">
            <ui-button size="sm" variant="secondary">Filter</UiButton>
            <template #end><ui-button size="sm">Export</UiButton></template>
          </ui-toolbar>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
