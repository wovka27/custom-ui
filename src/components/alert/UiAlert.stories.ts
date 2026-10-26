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
    <showcase-board>
      <showcase-case title="Tones">
        <ui-alert tone="neutral" title="Neutral" description="Quiet status." />
        <ui-alert tone="accent" title="Accent" description="A single signal." />
        <ui-alert tone="success" title="Saved" description="The profile is stored." />
        <ui-alert tone="warning" title="Review" description="A field still needs attention." />
        <ui-alert tone="danger" title="Failed" description="The request did not complete." />
        <ui-alert tone="info" title="Note" description="Color hangs off CSS variables." />
      </showcase-case>
      <showcase-case title="Dismissible">
        <ui-alert dismissible title="Draft archived" description="You can restore it later." />
      </showcase-case>
    </showcase-board>
  `,
  })),
)
