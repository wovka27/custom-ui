import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiEmpty } from '@/components/empty'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Empty',
  component: UiEmpty,
  args: {
    title: 'No invoices',
    description: 'Nothing matches this view.',
    variant: 'panel',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['plain', 'panel', 'dashed'] },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiButton, UiEmpty, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Plain" note="Sits inside a table or another frame.">
          <ui-empty variant="plain" title="No results" description="Nothing matches this view." />
        </showcase-case>
        <showcase-case title="Panel">
          <ui-empty variant="panel" title="No invoices" description="The desk has not filed one yet." />
        </showcase-case>
        <showcase-case title="Dashed" note="The actions slot holds the next step.">
          <ui-empty variant="dashed" title="No file" description="Drop a brief, or choose one.">
            <template #actions>
              <ui-button size="sm" variant="secondary">Choose a file</UiButton>
            </template>
          </ui-empty>
        </showcase-case>
      </showcase-board>
    `,
  })),
)
