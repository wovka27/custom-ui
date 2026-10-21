<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  UiButton,
  UiCluster,
  UiDialog,
  UiForm,
  UiStack,
  block,
  defineForm,
  email,
  group,
  query,
  table,
  type FormAsyncState,
  type FormQueryContext,
  type FormValue,
  type FormValues,
} from '@/index'

interface CloseLine {
  id: number
  line: string
}

const contractOpen = ref(false)
const witnessOpen = ref(false)
const contractSaved = ref(false)
const witnessSaved = ref(false)
const contractDismissed = ref(false)
const phase = ref('')
const log = ref<CloseLine[]>([])
const intakeValues = ref<FormValues>({})
let logId = 0

const plans = [
  { value: 'studio', label: 'Studio', hint: 'One active workspace' },
  { value: 'house', label: 'House', hint: 'Shared libraries and a retainer' },
] as const

const regions = [
  { value: 'eu', label: 'Europe' },
  { value: 'us', label: 'United States' },
] as const

const terms = [
  { value: '12', label: '12 months' },
  { value: '24', label: '24 months' },
  { value: '36', label: '36 months' },
] as const

const relationships = [
  { value: 'counsel', label: 'Counsel' },
  { value: 'finance', label: 'Finance' },
  { value: 'operator', label: 'Operator' },
] as const

const intake = defineForm([
  group({
    id: 'identity',
    title: 'Identity',
    description: 'A valid commission opens the contract dialog.',
    fields: [
      {
        kind: 'text',
        name: 'org',
        label: 'Organization',
        required: true,
        placeholder: 'Northwind',
        autocomplete: 'organization',
      },
      {
        kind: 'text',
        name: 'email',
        label: 'Email',
        type: 'email',
        required: true,
        rules: [email()],
        autocomplete: 'email',
        placeholder: 'ada@northwind.test',
      },
      {
        kind: 'text',
        name: 'phone',
        label: 'Phone',
        type: 'tel',
        format: 'phone',
        placeholder: '+1 202 555 0147',
      },
      {
        kind: 'radio',
        name: 'plan',
        label: 'Plan',
        required: true,
        defaultValue: 'studio',
        options: plans,
      },
    ],
  }),
  group({
    id: 'billing',
    title: 'Billing',
    description: 'House plans load cities for the chosen region.',
    when: (values) => values.plan === 'house',
    fields: [
      {
        kind: 'text',
        name: 'fee',
        label: 'Retainer',
        format: 'currency',
        currency: 'USD',
        placeholder: '0.00',
      },
      {
        kind: 'select',
        name: 'region',
        label: 'Region',
        required: true,
        placeholder: 'Choose a region',
        options: regions,
      },
      {
        kind: 'select',
        name: 'city',
        label: 'City',
        required: true,
        placeholder: 'Choose a city',
        disabled: (values) => text(values.region).length === 0,
        options: query({
          watch: ['region'],
          async load({ values, signal }) {
            await wait(220, signal)
            if (values.region === 'eu') {
              return [
                { value: 'berlin', label: 'Berlin' },
                { value: 'paris', label: 'Paris' },
              ]
            }
            if (values.region === 'us') {
              return [
                { value: 'austin', label: 'Austin' },
                { value: 'boston', label: 'Boston' },
              ]
            }
            return []
          },
        }),
      },
    ],
  }),
  block({
    id: 'dispatch',
    span: 'full',
    when: (values) => values.region === 'eu' || values.region === 'us',
    source: query({
      watch: ['region', 'city'],
      async load({ values, signal }) {
        await wait(220, signal)
        return `Dispatch is open for ${cityLabel(values.city)}.`
      },
    }),
  }),
  table({
    name: 'crew',
    label: 'Crew',
    caption: 'People on this desk',
    hint: 'Select who is working, then adjust the role.',
    required: true,
    columns: [
      { id: 'name', header: 'Name', width: '34%' },
      { id: 'role', header: 'Role', editable: true, required: true, minWidth: '10rem' },
    ],
    rows: [
      { id: 'ada', cells: { name: 'Ada', role: 'Editor' } },
      { id: 'lin', cells: { name: 'Lin', role: 'Producer' } },
      { id: 'mio', cells: { name: 'Mio', role: 'Counsel' } },
    ],
  }),
  {
    kind: 'textarea',
    name: 'notes',
    label: 'Notes',
    span: 'full',
    rows: 3,
    placeholder: 'What should the contract mention?',
  },
  {
    kind: 'switch',
    name: 'digest',
    label: 'Send a weekly digest',
    defaultValue: true,
  },
  {
    kind: 'checkbox',
    name: 'consent',
    label: 'The desk can contact this organization',
    required: true,
    span: 'full',
  },
])

const contract = defineForm([
  {
    kind: 'text',
    name: 'start',
    label: 'Start',
    format: 'date',
    required: true,
    placeholder: 'YYYY-MM-DD',
  },
  {
    kind: 'select',
    name: 'term',
    label: 'Term',
    required: true,
    placeholder: 'Choose a term',
    options: terms,
  },
  {
    kind: 'text',
    name: 'signer',
    label: 'Signer',
    required: true,
    placeholder: 'Ada Lovelace',
    autocomplete: 'name',
  },
  {
    kind: 'checkbox',
    name: 'agree',
    label: 'The signer can bind the organization',
    required: true,
    span: 'full',
  },
])

const witness = defineForm([
  {
    kind: 'text',
    name: 'name',
    label: 'Witness',
    required: true,
    placeholder: 'Lin Park',
    autocomplete: 'name',
  },
  {
    kind: 'text',
    name: 'email',
    label: 'Witness email',
    type: 'email',
    required: true,
    rules: [email()],
    placeholder: 'lin@northwind.test',
  },
  {
    kind: 'select',
    name: 'relationship',
    label: 'Relationship',
    required: true,
    placeholder: 'Choose a relationship',
    options: relationships,
  },
])

const orgLabel = computed(() => {
  const org = text(intakeValues.value.org)
  return org.length > 0 ? org : 'this desk'
})

function text(value: FormValue | undefined): string {
  return typeof value === 'string' ? value.trim() : ''
}

function cityLabel(value: FormValue | undefined): string {
  const city = text(value)
  if (city === 'berlin') return 'Berlin'
  if (city === 'paris') return 'Paris'
  if (city === 'austin') return 'Austin'
  if (city === 'boston') return 'Boston'
  return 'the chosen region'
}

function wait(ms: number, signal?: FormQueryContext['signal']): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      resolve()
    }, ms)
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timer)
        const error = new Error('Aborted')
        error.name = 'AbortError'
        reject(error)
      },
      { once: true },
    )
  })
}

function note(line: string): void {
  phase.value = line
  log.value = [...log.value, { id: logId, line }]
  logId += 1
}

function regionCopy(state: FormAsyncState<unknown>): string {
  if (state.status === 'success' && typeof state.data === 'string') return state.data
  if (state.status === 'error') return state.error.message
  return ''
}

function onIntake(values: FormValues): void {
  intakeValues.value = values
  contractSaved.value = false
  contractDismissed.value = false
  phase.value = ''
  contractOpen.value = true
}

function openWitness(): void {
  phase.value = ''
  witnessOpen.value = true
}

function resume(): void {
  contractDismissed.value = false
  contractOpen.value = true
}

function onContractSave(): void {
  contractSaved.value = true
  contractOpen.value = false
}

function onWitnessSave(): void {
  witnessSaved.value = true
  witnessOpen.value = false
}

function discardBoth(): void {
  witnessOpen.value = false
  contractOpen.value = false
}

async function closeWitness(): Promise<boolean> {
  note('Waiting to close the witness…')
  await wait(600)
  note('Witness closed.')
  return true
}

async function closeContract(): Promise<boolean> {
  note('Waiting to close the contract…')
  await wait(600)
  note('Contract closed.')
  if (!contractSaved.value) contractDismissed.value = true
  return true
}
</script>

<template>
  <section id="forms" class="section" aria-labelledby="forms-title">
    <UiStack gap="md">
      <header>
        <h2 id="forms-title" class="section-title">Forms</h2>
        <p class="lede">
          Fill the commission. A valid submit opens the contract, and the contract can open a
          witness. Dialogs wait before they close, and the top one finishes before the next.
        </p>
      </header>
      <div class="panel">
        <UiForm
          :schema="intake"
          label="Commission"
          submit-label="Continue to contract"
          columns="16rem"
          validate-on="blur"
          @submit="onIntake"
        >
          <template #block-dispatch="{ state }">
            <aside class="dispatch" aria-live="polite">
              <p v-if="state.status === 'pending'">Opening dispatch…</p>
              <p v-else>{{ regionCopy(state) }}</p>
            </aside>
          </template>
        </UiForm>
        <UiCluster v-if="contractDismissed || contractSaved" class="follow">
          <p v-if="contractSaved" role="status" class="meta">Contract saved for {{ orgLabel }}.</p>
          <UiButton v-if="contractDismissed" variant="secondary" @click="resume">
            Resume contract
          </UiButton>
        </UiCluster>
        <ol v-if="log.length > 0" class="close-log">
          <li v-for="entry in log" :key="entry.id">{{ entry.line }}</li>
        </ol>
      </div>
      <UiDialog
        v-model:open="contractOpen"
        size="lg"
        :title="`Contract for ${orgLabel}`"
        description="Save the terms, or add a witness above this dialog."
        :before-close="closeContract"
      >
        <UiStack gap="md">
          <p v-if="witnessSaved" role="status" class="meta">Witness recorded.</p>
          <p v-if="phase" role="status" class="meta">{{ phase }}</p>
          <UiForm
            :schema="contract"
            label="Terms"
            submit-label="Save contract"
            columns="14rem"
            @submit="onContractSave"
          />
        </UiStack>
        <template #footer="{ closing }">
          <UiCluster>
            <UiButton variant="secondary" :disabled="closing" @click="openWitness">
              Add witness
            </UiButton>
            <UiButton variant="ghost" :loading="closing" @click="discardBoth">
              Discard both
            </UiButton>
          </UiCluster>
        </template>
      </UiDialog>
      <UiDialog
        v-model:open="witnessOpen"
        title="Add a witness"
        description="This dialog closes first. The contract waits until this one finishes."
        :before-close="closeWitness"
      >
        <UiStack gap="md">
          <p v-if="phase" role="status" class="meta">{{ phase }}</p>
          <UiForm
            :schema="witness"
            label="Witness"
            submit-label="Save witness"
            columns="14rem"
            @submit="onWitnessSave"
          />
        </UiStack>
        <template #footer="{ closing }">
          <UiButton variant="ghost" :loading="closing" @click="discardBoth">
            Discard both
          </UiButton>
        </template>
      </UiDialog>
    </UiStack>
  </section>
</template>

<style scoped lang="scss">
.follow {
  margin-top: var(--ui-space-4);
}

.dispatch {
  width: 100%;
  min-width: 0;
  padding: var(--ui-space-3) var(--ui-space-4);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-bg);

  p {
    margin: 0;
    color: var(--ui-color-muted);
    font-size: var(--ui-font-size-sm);
  }
}

.close-log {
  margin: var(--ui-space-4) 0 0;
  padding-left: 1.25rem;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}
</style>
