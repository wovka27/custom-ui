import preview from '@sb/preview'
import { UiField } from '@/components/field'
import { UiInput } from '@/components/input'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Input',
  component: UiInput,
  args: {
    placeholder: 'Value',
    type: 'text',
    size: 'md',
    disabled: false,
    readonly: false,
    invalid: false,
  },
  argTypes: {
    type: {
      control: 'inline-radio',
      options: ['text', 'email', 'password', 'search', 'url', 'tel', 'number'],
    },
    format: {
      control: 'select',
      options: [
        undefined,
        'phone',
        'currency',
        'percent',
        'integer',
        'decimal',
        'date',
        'time',
        'credit-card',
        'iban',
        'postal',
      ],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
})

export const Playground = meta.story(playground())

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiField, UiInput, ShowcaseBoard, ShowcaseCase },
    template: `
    <ShowcaseBoard>
      <ShowcaseCase title="Formats" note="Canonical value stays in the model. The field shows the mask.">
        <UiField label="Phone"><UiInput format="phone" default-value="9991234567" /></UiField>
        <UiField label="Currency"><UiInput format="currency" locale="ru-RU" currency="RUB" default-value="12345.5" /></UiField>
        <UiField label="Date"><UiInput format="date" locale="ru-RU" default-value="2026-12-31" /></UiField>
        <UiField label="Card"><UiInput format="credit-card" default-value="4242424242424242" /></UiField>
      </ShowcaseCase>
      <ShowcaseCase title="Native">
        <UiField label="Email"><UiInput type="email" placeholder="ada@atelier.dev" /></UiField>
        <UiField label="Password"><UiInput type="password" default-value="correct horse" /></UiField>
        <UiField label="Search"><UiInput type="search" default-value="Harbor" /></UiField>
      </ShowcaseCase>
      <ShowcaseCase title="States">
        <UiInput placeholder="Disabled" disabled />
        <UiInput placeholder="Invalid" invalid default-value="nope" />
        <UiInput placeholder="Read only" readonly default-value="Locked" />
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
