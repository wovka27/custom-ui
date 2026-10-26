import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiResult } from '@/components/result'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Result',
  component: UiResult,
  args: { title: 'Invoice filed', description: 'The client can open it now.', tone: 'success' },
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
    components: { UiButton, UiResult, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Success">
          <ui-result title="Invoice filed" description="The client can open it now." tone="success">
            <template #media>OK</template>
            <template #actions><ui-button size="sm">View</UiButton></template>
          </ui-result>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
