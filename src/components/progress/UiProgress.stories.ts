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
      <ShowcaseBoard>
        <ShowcaseCase title="Line"><UiProgress variant="line" :value="64" label="Upload" /></ShowcaseCase>
        <ShowcaseCase title="Bar"><UiProgress variant="bar" :value="64" label="Sync" show-value /></ShowcaseCase>
        <ShowcaseCase title="Circle"><UiProgress variant="circle" :value="70" label="Sync" /></ShowcaseCase>
        <ShowcaseCase title="Steps"><UiProgress variant="steps" :value="40" label="Review" :steps="5" show-value /></ShowcaseCase>
        <ShowcaseCase title="Indeterminate"><UiProgress indeterminate label="Waiting" /></ShowcaseCase>
      </ShowcaseBoard>
    `,
  })),
)
