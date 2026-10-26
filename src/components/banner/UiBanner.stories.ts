import { ref } from 'vue'
import preview from '@sb/preview'
import { UiBanner } from '@/components/banner'
import { UiButton } from '@/components/button'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Banner',
  component: UiBanner,
  args: {
    title: 'Maintenance tonight',
    description: 'The desk is read-only from 02:00.',
    tone: 'warning',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'accent', 'success', 'warning', 'danger', 'info'],
    },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiBanner, UiButton, ShowcaseBoard, ShowcaseCase },
    setup() {
      const open = ref(true)
      return { open }
    },
    template: `
      <showcase-board>
        <showcase-case title="Dismiss">
          <ui-banner v-if="open" title="Maintenance tonight" tone="warning" dismissible @dismiss="open = false">
            The desk is read-only from 02:00.
            <template #actions><ui-button size="sm" variant="secondary">Details</UiButton></template>
          </ui-banner>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
