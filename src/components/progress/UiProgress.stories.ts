import preview from '@sb/preview'
import { UiProgress } from '@/components/progress'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Progress',
  component: UiProgress,
  args: { value: 64, max: 100, label: 'Upload', variant: 'line', size: 'md', indeterminate: false },
  argTypes: {
    variant: { control: 'inline-radio', options: ['line', 'bar', 'circle', 'steps'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiProgress, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Line"><ui-progress variant="line" :value="64" label="Upload" /></showcase-case>
        <showcase-case title="Bar"><ui-progress variant="bar" :value="64" label="Sync" show-value /></showcase-case>
        <showcase-case title="Circle"><ui-progress variant="circle" :value="70" label="Sync" /></showcase-case>
        <showcase-case title="Steps"><ui-progress variant="steps" :value="40" label="Review" :steps="5" show-value /></showcase-case>
        <showcase-case title="Indeterminate"><ui-progress indeterminate label="Waiting" /></showcase-case>
      </showcase-board>
    `,
  })),
)
