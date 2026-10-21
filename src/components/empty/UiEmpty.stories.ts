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
      <ShowcaseBoard>
        <ShowcaseCase title="Plain" note="Sits inside a table or another frame.">
          <UiEmpty variant="plain" title="No results" description="Nothing matches this view." />
        </ShowcaseCase>
        <ShowcaseCase title="Panel">
          <UiEmpty variant="panel" title="No invoices" description="The desk has not filed one yet." />
        </ShowcaseCase>
        <ShowcaseCase title="Dashed" note="The actions slot holds the next step.">
          <UiEmpty variant="dashed" title="No file" description="Drop a brief, or choose one.">
            <template #actions>
              <UiButton size="sm" variant="secondary">Choose a file</UiButton>
            </template>
          </UiEmpty>
        </ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
