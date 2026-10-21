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
    <ShowcaseBoard>
      <ShowcaseCase title="Variants">
        <UiButton>Primary</UiButton>
        <UiButton variant="secondary">Secondary</UiButton>
        <UiButton variant="ghost">Ghost</UiButton>
        <UiButton variant="danger">Danger</UiButton>
      </ShowcaseCase>
      <ShowcaseCase title="Sizes">
        <UiButton size="sm">Small</UiButton>
        <UiButton size="md">Medium</UiButton>
        <UiButton size="lg">Large</UiButton>
      </ShowcaseCase>
      <ShowcaseCase title="States">
        <UiButton loading>Saving</UiButton>
        <UiButton disabled>Disabled</UiButton>
        <UiButton aria-pressed="true">Pressed</UiButton>
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
