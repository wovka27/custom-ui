<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { UiDatePicker, isDateRange, type UiDateRange, type UiDateValue } from '@/components/date-picker'
import { useControllable } from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'

const {
  modelValue,
  defaultValue = null,
  range = false,
  locale,
  weekStartsOn = 1,
  min,
  max,
  placeholder = 'Choose a date and time',
  disabled,
  invalid,
  required,
  id,
  name,
} = defineProps<{
  modelValue?: UiDateValue
  defaultValue?: UiDateValue
  range?: boolean
  locale?: string
  weekStartsOn?: 0 | 1
  min?: string
  max?: string
  placeholder?: string
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  id?: string
  name?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UiDateValue]
  change: [value: UiDateValue]
}>()

defineSlots<{
  trigger(props: { open: boolean; label: string; toggle: () => void }): unknown
}>()

const field = useFieldControl({
  id: () => id,
  invalid: () => invalid,
  disabled: () => disabled,
  required: () => required,
})
const state = useControllable<UiDateValue>({
  value: () => modelValue,
  defaultValue: () => initialValue(),
  onChange: (next) => {
    emit('update:modelValue', next)
    emit('change', next)
  },
})
const startClock = ref('00:00')
const endClock = ref('00:00')

function initialValue(): UiDateValue {
  if (!range) return typeof defaultValue === 'string' ? defaultValue : null
  if (isDateRange(defaultValue)) return defaultValue
  if (typeof defaultValue === 'string') return { start: defaultValue, end: null }
  return { start: null, end: null }
}

function datePart(value: string | null): string | null {
  if (!value) return null
  return value.slice(0, 10)
}

function timePart(value: string | null): string {
  const time = value?.split('T')[1]
  return time ? time.slice(0, 5) : '00:00'
}

function join(date: string | null, time: string): string | null {
  if (!date) return null
  return `${date}T${time || '00:00'}`
}

function bound(value: string | undefined): string | undefined {
  if (!value) return undefined
  return value.slice(0, 10)
}

const dateModel = computed((): UiDateValue => {
  const value = state.value.value
  if (!range) return datePart(typeof value === 'string' ? value : null)
  const span = isDateRange(value) ? value : { start: null, end: null }
  return { start: datePart(span.start), end: datePart(span.end) }
})

const label = computed(() => {
  const format = (value: string): string => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(locale || globalThis.navigator?.language || 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }
  const value = state.value.value
  if (isDateRange(value)) {
    if (value.start && value.end) return `${format(value.start)} – ${format(value.end)}`
    if (value.start) return format(value.start)
    return placeholder
  }
  return typeof value === 'string' ? format(value) : placeholder
})

function writeDate(next: UiDateValue): void {
  if (!range) {
    state.setValue(join(typeof next === 'string' ? next : null, startClock.value))
    return
  }
  const span = isDateRange(next) ? next : { start: null, end: null }
  state.setValue({
    start: join(span.start, startClock.value),
    end: join(span.end, endClock.value),
  })
}

function onClock(edge: 'start' | 'end', event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  const time = target.value || '00:00'
  if (edge === 'start') startClock.value = time
  else endClock.value = time
  const value = state.value.value
  if (!range) {
    state.setValue(join(datePart(typeof value === 'string' ? value : null), time))
    return
  }
  const span = isDateRange(value) ? value : { start: null, end: null }
  const next: UiDateRange =
    edge === 'start'
      ? { start: join(datePart(span.start), time), end: span.end }
      : { start: span.start, end: join(datePart(span.end), time) }
  state.setValue(next)
}

watch(
  () => state.value.value,
  (value) => {
    if (typeof value === 'string') startClock.value = timePart(value)
    if (!isDateRange(value)) return
    if (value.start) startClock.value = timePart(value.start)
    if (value.end) endClock.value = timePart(value.end)
  },
  { immediate: true },
)
</script>

<template>
  <div class="ui-datetime">
    <ui-date-picker
      :id="id"
      :model-value="dateModel"
      :range="range"
      :locale="locale"
      :week-starts-on="weekStartsOn"
      :min="bound(min)"
      :max="bound(max)"
      :placeholder="placeholder"
      :disabled="disabled"
      :invalid="invalid"
      :required="required"
      @update:model-value="writeDate"
    >
      <template #trigger="{ open, toggle }">
        <slot name="trigger" :open="open" :label="label" :toggle="toggle">
          <button
            :id="field.controlId.value"
            class="ui-datetime__button"
            type="button"
            :aria-expanded="open"
            :aria-invalid="field.isInvalid.value || undefined"
            :aria-describedby="field.describedBy.value"
            :disabled="field.isDisabled.value || undefined"
          >
            {{ label }}
          </button>
        </slot>
      </template>
      <template #footer="{ clear, today }">
        <div class="ui-datetime__times">
          <label>
            <span>{{ range ? 'Start time' : 'Time' }}</span>
            <input
              type="time"
              :value="startClock"
              :disabled="disabled || undefined"
              @input="onClock('start', $event)"
            />
          </label>
          <label v-if="range">
            <span>End time</span>
            <input
              type="time"
              :value="endClock"
              :disabled="disabled || undefined"
              @input="onClock('end', $event)"
            />
          </label>
        </div>
        <div class="ui-datetime__actions">
          <button type="button" @click="clear">Clear</button>
          <button type="button" @click="today">Today</button>
        </div>
      </template>
    </ui-date-picker>
    <input
      v-if="name && !range"
      type="hidden"
      :name="name"
      :value="typeof state.value.value === 'string' ? state.value.value : ''"
    />
    <template v-else-if="name && isDateRange(state.value.value)">
      <input type="hidden" :name="`${name}Start`" :value="state.value.value.start ?? ''" />
      <input type="hidden" :name="`${name}End`" :value="state.value.value.end ?? ''" />
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-datetime {
  width: 100%;
}

.ui-datetime__button {
  @include control-field;
  text-align: start;
  cursor: pointer;
}

.ui-datetime__times {
  display: grid;
  gap: var(--ui-space-2);
  margin-bottom: var(--ui-space-3);
}

.ui-datetime__times label {
  display: grid;
  gap: 0.25rem;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.ui-datetime__times input {
  @include control-field;
}

.ui-datetime__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ui-datetime__actions button {
  border: 0;
  background: transparent;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }
}
</style>
