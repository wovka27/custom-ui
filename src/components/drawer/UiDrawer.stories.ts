import { ref } from 'vue'
import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiDrawer } from '@/components/drawer'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Overlay/Drawer',
  component: UiDrawer,
  args: { title: 'Filters', description: 'Narrow the desk.', side: 'end' },
  argTypes: { side: { control: 'inline-radio', options: ['start', 'end', 'bottom'] } },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiButton, UiDrawer },
      setup() {
        const open = ref(false)
        return { args, open }
      },
      template: `
        <ui-button @click="open = true">Open drawer</UiButton>
        <ui-drawer v-bind="args" v-model:open="open">
          Status, owner, and date.
          <template #footer="{ close }">
            <ui-button variant="secondary" @click="close">Close</UiButton>
          </template>
        </ui-drawer>
      `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiButton, UiDrawer, ShowcaseBoard, ShowcaseCase },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <showcase-board>
        <showcase-case title="End">
          <ui-button @click="open = true">Filters</UiButton>
          <ui-drawer v-model:open="open" title="Filters" description="Narrow the desk.">
            Status, owner, and date.
          </ui-drawer>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
