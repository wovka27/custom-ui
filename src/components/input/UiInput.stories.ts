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
    <showcase-board>
      <showcase-case title="Formats" note="Canonical value stays in the model. The field shows the mask.">
        <ui-field label="Phone"><ui-input format="phone" default-value="9991234567" /></ui-field>
        <ui-field label="Currency"><ui-input format="currency" locale="ru-RU" currency="RUB" default-value="12345.5" /></ui-field>
        <ui-field label="Date"><ui-input format="date" locale="ru-RU" default-value="2026-12-31" /></ui-field>
        <ui-field label="Card"><ui-input format="credit-card" default-value="4242424242424242" /></ui-field>
      </showcase-case>
      <showcase-case title="Native">
        <ui-field label="Email"><ui-input type="email" placeholder="ada@atelier.dev" /></ui-field>
        <ui-field label="Password"><ui-input type="password" default-value="correct horse" /></ui-field>
        <ui-field label="Search"><ui-input type="search" default-value="Harbor" /></ui-field>
      </showcase-case>
      <showcase-case title="States">
        <ui-input placeholder="Disabled" disabled />
        <ui-input placeholder="Invalid" invalid default-value="nope" />
        <ui-input placeholder="Read only" readonly default-value="Locked" />
      </showcase-case>
    </showcase-board>
  `,
  })),
)
