import preview from '@sb/preview'
import { UiRadioGroup } from '@/components/radio-group'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'
import type { UiOption } from '@/types/common'

const plans: readonly UiOption<'studio' | 'house' | 'archive'>[] = [
  { value: 'studio', label: 'Studio', hint: 'One active workspace' },
  { value: 'house', label: 'House', hint: 'Shared libraries' },
  { value: 'archive', label: 'Archive', hint: 'Read-only history' },
]

const meta = preview.meta({
  title: 'Controls/Radio group',
  component: UiRadioGroup,
  args: {
    legend: 'Plan',
    name: 'plan',
    options: plans,
    defaultValue: 'studio',
    disabled: false,
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiRadioGroup, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ plans }),
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="With hints">
        <UiRadioGroup legend="Plan" name="plan-showcase" :options="plans" default-value="studio" />
      </ShowcaseCase>
      <ShowcaseCase title="Disabled">
        <UiRadioGroup legend="Plan" name="plan-disabled" :options="plans" default-value="house" disabled />
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
