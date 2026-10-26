import { ref } from 'vue'
import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiField } from '@/components/field'
import { UiInput } from '@/components/input'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'

const meta = preview.meta({
  title: 'Controls/Field',
  component: UiField,
  args: {
    label: 'Email',
    hint: 'Used for sign-in and receipts.',
    error: '',
    required: true,
    disabled: false,
    hideLabel: false,
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiField, UiInput },
      setup: () => ({ args }),
      template:
        '<ui-field v-bind="args"><ui-input type="email" placeholder="ada@atelier.dev" /></ui-field>',
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiField, UiInput, UiButton, ShowcaseBoard, ShowcaseCase },
    setup() {
      const error = ref('')
      function toggle(): void {
        error.value = error.value ? '' : 'Enter a valid email address.'
      }
      return { error, toggle }
    },
    template: `
    <showcase-board>
      <showcase-case title="Hint">
        <ui-field label="Email" hint="Used for sign-in and receipts.">
          <ui-input type="email" placeholder="ada@atelier.dev" />
        </ui-field>
      </showcase-case>
      <showcase-case title="Error">
        <ui-field label="Email" required error="Enter a valid email address.">
          <ui-input type="email" invalid default-value="ada" />
        </ui-field>
      </showcase-case>
      <showcase-case title="Motion">
        <ui-field label="Email" required :error="error">
          <ui-input type="email" :invalid="Boolean(error)" default-value="ada" />
        </ui-field>
        <ui-button type="button" variant="secondary" @click="toggle">
          {{ error ? 'Clear error' : 'Show error' }}
        </ui-button>
      </showcase-case>
    </showcase-board>
  `,
  })),
)
