import preview from '@sb/preview'
import { UiAppShell } from '@/components/layout'
import { playground, showcases } from '@/stories/templates'

const shell = `
  <UiAppShell v-bind="args">
    <template #header><strong>Custom UI</strong></template>
    <template #sidebar><nav>Forms<br />Data<br />Layout</nav></template>
    <p>Main content sits beside the sidebar and stacks under it on a narrow viewport.</p>
    <template #footer>Custom UI Kit</template>
  </UiAppShell>
`

const meta = preview.meta({
  title: 'Layout/App shell',
  component: UiAppShell,
  parameters: { layout: 'fullscreen' },
  args: {
    sidebarLabel: 'Gallery',
    contentLabel: 'Component gallery',
    navOpen: true,
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiAppShell },
      setup: () => ({ args }),
      template: shell,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(
    () => ({
      components: { UiAppShell },
      setup() {
        return {
          args: { sidebarLabel: 'Gallery', contentLabel: 'Component gallery', navOpen: true },
        }
      },
      template: shell,
    }),
    { layout: 'fullscreen' },
  ),
)
