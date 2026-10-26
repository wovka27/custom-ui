import preview from '@sb/preview'
import { UiInputOtp } from '@/components/input-otp'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Input OTP',
  component: UiInputOtp,
  args: { length: 6, label: 'Code' },
  argTypes: { modelValue: { control: false } },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiInputOtp, ShowcaseBoard, ShowcaseCase },
    template: `
      <showcase-board>
        <showcase-case title="Six digits" note="Paste fills the remaining cells.">
          <ui-input-otp />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
