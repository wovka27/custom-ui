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
        '<UiField v-bind="args"><UiInput type="email" placeholder="ada@atelier.dev" /></UiField>',
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
    <ShowcaseBoard>
      <ShowcaseCase title="Hint">
        <UiField label="Email" hint="Used for sign-in and receipts.">
          <UiInput type="email" placeholder="ada@atelier.dev" />
        </UiField>
      </ShowcaseCase>
      <ShowcaseCase title="Error">
        <UiField label="Email" required error="Enter a valid email address.">
          <UiInput type="email" invalid default-value="ada" />
        </UiField>
      </ShowcaseCase>
      <ShowcaseCase title="Motion">
        <UiField label="Email" required :error="error">
          <UiInput type="email" :invalid="Boolean(error)" default-value="ada" />
        </UiField>
        <UiButton type="button" variant="secondary" @click="toggle">
          {{ error ? 'Clear error' : 'Show error' }}
        </UiButton>
      </ShowcaseCase>
    </ShowcaseBoard>
  `,
  })),
)
