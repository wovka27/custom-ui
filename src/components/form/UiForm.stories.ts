import { ref } from 'vue'
import preview from '@sb/preview'
import { UiButton } from '@/components/button'
import { UiCluster } from '@/components/layout'
import {
  block,
  UiForm,
  defineForm,
  email,
  group,
  minLength,
  query,
  sameAs,
  serverErrors,
  table,
  type FormValue,
  type FormValues,
} from '@/components/form'
import { playground, ShowcaseBoard, ShowcaseCase, showcases } from '@/stories/templates'
import type { UiOption } from '@/types/common'

const roles: readonly UiOption<'editor' | 'producer' | 'admin'>[] = [
  { value: 'editor', label: 'Editor' },
  { value: 'producer', label: 'Producer' },
  { value: 'admin', label: 'Admin' },
]

const plans: readonly UiOption<'studio' | 'house'>[] = [
  { value: 'studio', label: 'Studio', hint: 'One active workspace' },
  { value: 'house', label: 'House', hint: 'Shared libraries' },
]

const profile = defineForm([
  {
    kind: 'text',
    name: 'email',
    label: 'Email',
    type: 'email',
    required: true,
    rules: [email()],
    autocomplete: 'email',
    placeholder: 'ada@atelier.dev',
  },
  {
    kind: 'select',
    name: 'role',
    label: 'Role',
    options: roles,
    placeholder: 'Choose a role',
    required: true,
    requiredMessage: 'Choose a role.',
  },
  {
    kind: 'textarea',
    name: 'notes',
    label: 'Notes',
    autoSize: true,
    placeholder: 'What should the team know?',
    span: 'full',
  },
  {
    kind: 'checkbox',
    name: 'agree',
    label: 'I agree to the workspace terms.',
    required: true,
    requiredMessage: 'Consent is required before saving.',
    span: 'full',
  },
])

const account = defineForm([
  group({
    id: 'identity',
    title: 'Identity',
    description: 'Stored on the profile. Masks keep the canonical value.',
    columns: '16rem',
    fields: [
      {
        kind: 'text',
        name: 'name',
        label: 'Name',
        required: true,
        autocomplete: 'name',
        placeholder: 'Ada Lovelace',
      },
      {
        kind: 'text',
        name: 'phone',
        label: 'Phone',
        format: 'phone',
        placeholder: '(999) 123-45-67',
      },
      {
        kind: 'text',
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        rules: [minLength(8)],
        autocomplete: 'new-password',
      },
      {
        kind: 'text',
        name: 'confirm',
        label: 'Confirm',
        type: 'password',
        required: true,
        rules: [sameAs('password', 'Passwords do not match.')],
        autocomplete: 'new-password',
      },
    ],
  }),
  group({
    id: 'billing',
    title: 'Billing',
    columns: '16rem',
    fields: [
      {
        kind: 'radio',
        name: 'plan',
        label: 'Plan',
        options: plans,
        defaultValue: 'studio',
        span: 'full',
      },
      {
        kind: 'text',
        name: 'company',
        label: 'Company',
        required: true,
        when: (values) => values.plan === 'house',
      },
      {
        kind: 'text',
        name: 'retainer',
        label: 'Retainer',
        format: 'currency',
        locale: 'ru-RU',
        currency: 'RUB',
        hint: 'Stored as a decimal, shown in rubles.',
        when: (values) => values.plan === 'house',
      },
      {
        kind: 'text',
        name: 'issued',
        label: 'Issued',
        format: 'date',
        locale: 'ru-RU',
        placeholder: '31.12.2026',
        span: 'full',
      },
    ],
  }),
  group({
    id: 'preferences',
    title: 'Preferences',
    fields: [
      {
        kind: 'custom',
        name: 'priority',
        label: 'Priority',
        defaultValue: 'normal',
        hint: 'A slot can replace any control.',
      },
      {
        kind: 'switch',
        name: 'digest',
        label: 'Send a weekly digest',
        defaultValue: true,
        span: 'full',
      },
    ],
  }),
])

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve()
    }, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        const error = new Error('Aborted')
        error.name = 'AbortError'
        reject(error)
      },
      { once: true },
    )
  })
}

function cityLabel(value: FormValue | undefined): string {
  if (typeof value !== 'string') return 'the region'
  const match = [...cities.eu, ...cities.us].find((option) => option.value === value)
  return match?.label ?? 'the region'
}

const cities = {
  eu: [
    { value: 'berlin', label: 'Berlin' },
    { value: 'paris', label: 'Paris' },
  ],
  us: [
    { value: 'austin', label: 'Austin' },
    { value: 'seattle', label: 'Seattle' },
  ],
} as const

const territory = defineForm([
  {
    kind: 'select',
    name: 'region',
    label: 'Region',
    placeholder: 'Choose a region',
    required: true,
    options: [
      { value: 'eu', label: 'Europe' },
      { value: 'us', label: 'United States' },
    ],
  },
  {
    kind: 'select',
    name: 'city',
    label: 'City',
    placeholder: 'Choose a city',
    required: true,
    when: (values) => values.region === 'eu' || values.region === 'us',
    options: query({
      watch: ['region'],
      async load({ values, signal }) {
        const region = values.region === 'eu' || values.region === 'us' ? values.region : undefined
        if (!region) return []
        await wait(320, signal)
        return cities[region]
      },
    }),
  },
  {
    kind: 'text',
    name: 'vat',
    label: 'VAT',
    placeholder: 'DE123456789',
    required: true,
    when: query({
      watch: ['region'],
      async load({ values, signal }) {
        if (values.region !== 'eu') return false
        await wait(320, signal)
        return true
      },
    }),
  },
  block({
    id: 'dispatch',
    span: 'full',
    when: (values) => values.region === 'eu' || values.region === 'us',
    source: query({
      watch: ['region', 'city'],
      async load({ values, signal }) {
        await wait(240, signal)
        return `Dispatch is open for ${cityLabel(values.city)}.`
      },
    }),
  }),
  group({
    id: 'desk',
    title: 'Desk',
    description: 'This section is not another field. It opens from the city choice.',
    source: query({
      watch: ['city'],
      async load({ values, signal }) {
        if (typeof values.city !== 'string' || values.city.length === 0) return ''
        await wait(240, signal)
        return `Coverage for ${cityLabel(values.city)} is confirmed.`
      },
    }),
    when: query({
      watch: ['city'],
      async load({ values, signal }) {
        if (typeof values.city !== 'string' || values.city.length === 0) return false
        await wait(240, signal)
        return true
      },
    }),
    fields: [
      {
        kind: 'text',
        name: 'badge',
        label: 'Badge',
        placeholder: 'Desk number',
      },
    ],
  }),
])

const roster = defineForm([
  table({
    name: 'crew',
    label: 'Crew',
    caption: 'People on this desk',
    hint: 'Select who is working, then adjust the role.',
    required: true,
    columns: [
      { id: 'name', header: 'Name', width: '40%' },
      { id: 'role', header: 'Role', editable: true, required: true },
    ],
    rows: [
      { id: 'ada', cells: { name: 'Ada', role: 'Editor' } },
      { id: 'lin', cells: { name: 'Lin', role: 'Producer' } },
    ],
  }),
])

const handle = defineForm([
  {
    kind: 'text',
    name: 'handle',
    label: 'Handle',
    required: true,
    rules: [
      {
        validate: (value) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(value === 'ada' ? 'Ada is taken.' : undefined)
            }, 180)
          }),
      },
    ],
  },
])

const signals = defineForm([
  { kind: 'date', name: 'due', label: 'Due', range: true },
  { kind: 'datetime', name: 'slot', label: 'Slot' },
  { kind: 'number', name: 'seats', label: 'Seats', min: 1, max: 12, defaultValue: 2 },
  { kind: 'rate', name: 'score', label: 'Score', max: 5, defaultValue: 4 },
  { kind: 'slider', name: 'volume', label: 'Volume', defaultValue: 40 },
  { kind: 'color', name: 'ink', label: 'Ink', variant: 'swatches' },
  { kind: 'tags', name: 'labels', label: 'Labels', placeholder: 'Label' },
  { kind: 'otp', name: 'code', label: 'Code', length: 4 },
  {
    kind: 'segmented',
    name: 'pace',
    label: 'Pace',
    options: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
    ],
  },
  { kind: 'upload', name: 'brief', label: 'Brief', multiple: false, dropLabel: 'Drop a brief' },
])

function rejectHandle(): never {
  throw serverErrors({ handle: 'The desk already has this handle.' })
}

const meta = preview.meta({
  title: 'Controls/Form',
  component: UiForm,
  args: {
    submitLabel: 'Save profile',
    resetLabel: 'Reset',
    showReset: true,
    columns: '16rem',
    validateOn: 'blur',
    label: 'Profile',
  },
  argTypes: {
    validateOn: { control: 'inline-radio', options: ['submit', 'blur', 'input'] },
    gap: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] },
  },
})

export const Playground = meta.story(
  playground({
    render: (args) => ({
      components: { UiForm },
      setup() {
        const saved = ref('')
        function onSubmit(values: FormValues): void {
          saved.value = `${values.email} · ${values.role}`
        }
        return { args, profile, saved, onSubmit }
      },
      template: `
        <div style="width: min(40rem, 100%)">
          <ui-form
            :schema="profile"
            :label="args.label"
            :submit-label="args.submitLabel"
            :reset-label="args.resetLabel"
            :show-reset="args.showReset"
            :columns="args.columns"
            :validate-on="args.validateOn"
            :gap="args.gap"
            success-label="Profile saved."
            @submit="onSubmit"
          />
          <p v-if="saved" role="status" style="margin-top: 0.75rem">{{ saved }}</p>
        </div>
      `,
    }),
  }),
)

export const Showcases = meta.story(
  showcases(() => ({
    components: { UiButton, UiCluster, UiForm, ShowcaseBoard, ShowcaseCase },
    setup: () => ({ account, territory, roster, handle, signals, rejectHandle }),
    template: `
      <showcase-board>
        <showcase-case title="Schema" note="Groups, masks, a conditional pair, and a custom control.">
          <ui-form :schema="account" submit-label="Create account" success-label="Account created." style="width: 100%; max-width: 46rem">
            <template #field-priority="{ value, setValue, disabled }">
              <ui-cluster>
                <ui-button
                  v-for="level in ['low', 'normal', 'high']"
                  :key="level"
                  type="button"
                  :aria-pressed="value === level"
                  :disabled="disabled"
                  @click="setValue(level)"
                >
                  {{ level }}
                </ui-button>
              </ui-cluster>
            </template>
          </ui-form>
        </showcase-case>
        <showcase-case title="Async" note="A choice loads options, reveals a field, and opens a block that is not a field.">
          <ui-form :schema="territory" label="Territory" submit-label="Save territory" style="width: 100%; max-width: 46rem">
            <template #block-dispatch="{ state }">
              <aside style="width: 100%; border: 1px solid var(--ui-color-border); border-radius: 4px; padding: 0.75rem 1rem">
                <p v-if="state.status === 'pending'" style="margin: 0">Opening dispatch…</p>
                <p v-else-if="state.status === 'success'" style="margin: 0">{{ state.data }}</p>
                <p v-else-if="state.status === 'error'" style="margin: 0">{{ state.error.message }}</p>
              </aside>
            </template>
            <template #section-desk="{ state }">
              <p v-if="state.status === 'pending'" style="margin: 0">Checking the desk…</p>
              <p v-else-if="state.status === 'success' && state.data" style="margin: 0">{{ state.data }}</p>
              <p v-else-if="state.status === 'error'" role="alert" style="margin: 0">{{ state.error.message }}</p>
            </template>
          </ui-form>
        </showcase-case>
        <showcase-case title="Async field" note="Ada fails in the field. Any other handle is rejected by the server onto that same field.">
          <ui-form :schema="handle" label="Handle" submit-label="Reserve" :on-submit="rejectHandle" style="width: 100%; max-width: 24rem" />
        </showcase-case>
        <showcase-case title="New controls" note="Date, time, slider, color, tags, code, segmented choice, and upload.">
          <ui-form :schema="signals" label="Signals" submit-label="Save signals" style="width: 100%; max-width: 28rem" />
        </showcase-case>
        <showcase-case title="Table" note="Selection and edited cells belong to the form model.">
          <ui-form :schema="roster" label="Desk" submit-label="Save crew" style="width: 100%" />
        </showcase-case>
      </showcase-board>
    `,
  })),
)
