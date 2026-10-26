import preview from '@sb/preview'
import { UiSkeleton } from '@/components/skeleton'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Feedback/Skeleton',
  component: UiSkeleton,
  args: { variant: 'text', lines: 3 },
  argTypes: { variant: { control: 'inline-radio', options: ['text', 'block', 'circle'] } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiSkeleton, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Text"><ui-skeleton :lines="3" /></showcase-case>
        <showcase-case title="Block"><ui-skeleton variant="block" width="100%" /></showcase-case>
        <showcase-case title="Circle"><ui-skeleton variant="circle" /></showcase-case>
      </showcase-board>
    `,
  })),
)
