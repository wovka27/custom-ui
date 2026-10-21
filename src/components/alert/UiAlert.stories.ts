import preview from '@sb/preview'
import { UiAlert } from '@/components/alert'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Alert',
  component: UiAlert,
  args: {
    title: 'Review the contrast tokens',
    description: 'Accent and danger pairs are tuned for both themes.',
    tone: 'info',
    dismissible: false,
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
    components: { UiAlert, ShowcaseBoard, ShowcaseCase },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="Tones">
        <UiAlert tone="neutral" title="Neutral" description="Quiet status." />
        <UiAlert tone="accent" title="Accent" description="A single signal." />
        <UiAlert tone="success" title="Saved" description="The profile is stored." />
        <UiAlert tone="warning" title="Review" description="A field still needs attention." />
        <UiAlert tone="danger" title="Failed" description="The request did not complete." />
        <UiAlert tone="info" title="Note" description="Color hangs off CSS variables." />
      </ShowcaseCase>
      <ShowcaseCase title="Dismissible">
        <UiAlert dismissible title="Draft archived" description="You can restore it later." />
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
