import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Button',
  component: UiButton,
  args: {
    default: 'Save profile',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    block: false,
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    default: { control: 'text', name: 'Label' },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiButton, ShowcaseBoard, ShowcaseCase },
    template: `
    <showcase-board>
      <showcase-case title="Variants">
        <ui-button>Primary</UiButton>
        <ui-button variant="secondary">Secondary</UiButton>
        <ui-button variant="ghost">Ghost</UiButton>
        <ui-button variant="danger">Danger</UiButton>
      </showcase-case>
      <showcase-case title="Sizes">
        <ui-button size="sm">Small</UiButton>
        <ui-button size="md">Medium</UiButton>
        <ui-button size="lg">Large</UiButton>
      </showcase-case>
      <showcase-case title="States">
        <ui-button loading>Saving</UiButton>
        <ui-button disabled>Disabled</UiButton>
        <ui-button aria-pressed="true">Pressed</UiButton>
      </showcase-case>
    </showcase-board>
  `,
  })),
)
