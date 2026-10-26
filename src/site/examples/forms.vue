<script setup lang="ts">
import { ref } from 'vue'
import type { FormValues } from '@/index'
import {
  defineForm,
  UiAutocomplete,
  UiButton,
  UiCheckbox,
  UiCluster,
  UiColorPicker,
  UiDatePicker,
  UiDateTimePicker,
  UiField,
  UiForm,
  UiInput,
  UiInputOtp,
  UiInputTag,
  UiNumberField,
  UiRadioGroup,
  UiRate,
  UiSearch,
  UiSegmented,
  UiSelect,
  UiSlider,
  UiStack,
  UiSwitch,
  UiTextarea,
  UiTimeField,
  UiUpload,
} from '@/index'

const { name } = defineProps<{ name: string }>()

const client = ref('')
const clients = [
  { value: 'north', label: 'North dock' },
  { value: 'house', label: 'House' },
  { value: 'studio', label: 'Studio One' },
]
const agreed = ref(false)
const quantity = ref(2)
const watch = ref('open')
const watches = [
  { value: 'open', label: 'Open' },
  { value: 'held', label: 'Held' },
  { value: 'closed', label: 'Closed' },
]
const score = ref(4)
const view = ref('week')
const views = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]
const status = ref<string | null>(null)
const statuses = [
  { value: 'open', label: 'Open' },
  { value: 'filed', label: 'Filed' },
]
const volume = ref(40)
const windowSpan = ref<[number, number]>([24, 76])
const open = ref(true)
const note = ref('The brief reached the desk.')
const when = ref('09:30')
const tags = ref<string[]>(['Ada'])
const query = ref('')
const saved = ref('')

const profile = defineForm([
  { kind: 'text', name: 'name', label: 'Name', required: true },
  { kind: 'text', name: 'email', label: 'Email', type: 'email', required: true },
])

function onSubmit(values: FormValues): void {
  const next = values.name
  saved.value = typeof next === 'string' ? next : ''
}

function setVolume(value: number | readonly [number, number]): void {
  if (typeof value === 'number') volume.value = value
}

function setWindow(value: number | readonly [number, number]): void {
  if (typeof value === 'number') return
  const [start, end] = value
  if (typeof start === 'number' && typeof end === 'number') windowSpan.value = [start, end]
}
</script>

<template>
  <ui-autocomplete
    v-if="name === 'UiAutocomplete'"
    v-model="client"
    label="Client"
    placeholder="Find a client"
    :options="clients"
  />

  <ui-stack v-else-if="name === 'UiButton'" gap="md">
    <p>Variant</p>
    <ui-cluster>
      <ui-button>Save</ui-button>
      <ui-button variant="secondary">Cancel</ui-button>
      <ui-button variant="ghost">Dismiss</ui-button>
      <ui-button variant="danger">Delete</ui-button>
    </ui-cluster>
    <p>Size</p>
    <ui-cluster>
      <ui-button size="sm">Small</ui-button>
      <ui-button>Medium</ui-button>
      <ui-button size="lg">Large</ui-button>
    </ui-cluster>
    <p>State</p>
    <ui-cluster>
      <ui-button loading>Saving</ui-button>
      <ui-button disabled>Filed</ui-button>
    </ui-cluster>
  </ui-stack>

  <ui-cluster v-else-if="name === 'UiCheckbox'">
    <ui-checkbox label="Open" />
    <ui-checkbox v-model="agreed" label="The brief is ready" />
    <ui-checkbox indeterminate label="Mixed" />
  </ui-cluster>

  <ui-cluster v-else-if="name === 'UiColorPicker'">
    <ui-color-picker />
    <ui-color-picker variant="swatches" label="Swatches" />
  </ui-cluster>

  <ui-cluster v-else-if="name === 'UiDatePicker'">
    <ui-date-picker />
    <ui-date-picker range placeholder="Start and end" />
  </ui-cluster>

  <ui-cluster v-else-if="name === 'UiDateTimePicker'">
    <ui-date-time-picker />
    <ui-date-time-picker range placeholder="Start and end" />
  </ui-cluster>

  <ui-field
    v-else-if="name === 'UiField'"
    label="Name"
    hint="The name on the brief"
    style="max-width: 20rem"
  >
    <ui-input placeholder="Ada" aria-label="Name" />
  </ui-field>

  <ui-stack v-else-if="name === 'UiForm'" gap="sm">
    <ui-form :schema="profile" label="Profile" submit-label="Save" @submit="onSubmit" />
    <p v-if="saved" role="status">Saved {{ saved }}.</p>
  </ui-stack>

  <ui-stack v-else-if="name === 'UiInput'" gap="sm" style="max-width: 20rem">
    <ui-input size="sm" placeholder="Small" aria-label="Small name" />
    <ui-input placeholder="Medium" aria-label="Medium name" />
    <ui-input size="lg" placeholder="Large" aria-label="Large name" />
  </ui-stack>

  <ui-input-otp v-else-if="name === 'UiInputOtp'" label="Code" />

  <ui-input-tag v-else-if="name === 'UiInputTag'" v-model="tags" placeholder="Name" />

  <ui-number-field
    v-else-if="name === 'UiNumberField'"
    v-model="quantity"
    label="Quantity"
    :min="0"
    :max="12"
  />

  <ui-radio-group
    v-else-if="name === 'UiRadioGroup'"
    v-model="watch"
    legend="Watch"
    :options="watches"
  />

  <ui-rate v-else-if="name === 'UiRate'" v-model="score" label="Satisfaction" />

  <ui-search v-else-if="name === 'UiSearch'" label="Clients">
    <ui-field label="Search clients">
      <ui-input v-model="query" type="search" placeholder="Client name" />
    </ui-field>
  </ui-search>

  <ui-segmented v-else-if="name === 'UiSegmented'" v-model="view" :options="views" label="View" />

  <ui-field v-else-if="name === 'UiSelect'" label="Status" style="max-width: 16rem">
    <ui-select v-model="status" :options="statuses" all-option name="status" />
  </ui-field>

  <ui-stack v-else-if="name === 'UiSlider'" gap="md">
    <p>Volume {{ volume }}</p>
    <ui-slider :model-value="volume" label="Volume" @update:model-value="setVolume" />
    <p>Window {{ windowSpan[0] }} – {{ windowSpan[1] }}</p>
    <ui-slider :model-value="windowSpan" range label="Window" @update:model-value="setWindow" />
  </ui-stack>

  <ui-switch v-else-if="name === 'UiSwitch'" v-model="open" label="Night watch" />

  <ui-textarea
    v-else-if="name === 'UiTextarea'"
    v-model="note"
    aria-label="Note"
    style="max-width: 24rem"
  />

  <ui-time-field v-else-if="name === 'UiTimeField'" v-model="when" label="Call time" />

  <ui-cluster v-else-if="name === 'UiUpload'">
    <ui-upload label="Drop a file" accept="image/*" />
    <ui-upload variant="button" label="Choose a file" accept="image/*" />
    <ui-upload variant="picture" shape="circle" label="Portrait" accept="image/*" />
    <ui-upload variant="gallery" label="Add" accept="image/*" />
  </ui-cluster>
</template>

<style scoped lang="scss">
p {
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  font-variant-numeric: tabular-nums;
}
</style>
