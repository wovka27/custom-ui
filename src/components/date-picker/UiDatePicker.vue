<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from 'vue'
import { Key } from '@/a11y/keys'
import { UiPopover } from '@/components/popover'
import { useControllable } from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'
import {
  calendarDays,
  monthLabel,
  parseIso,
  shiftMonth,
  toIso,
  weekdayLabels,
  type CalendarDay,
} from './calendar'
import { isDateRange, type UiDateRange, type UiDateValue } from './value'

const {
  modelValue,
  defaultValue = null,
  range = false,
  locale,
  weekStartsOn = 1,
  min,
  max,
  placeholder = 'Choose a date',
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
  header(props: { label: string; previous: () => void; next: () => void }): unknown
  day(props: {
    day: CalendarDay
    selected: boolean
    inRange: boolean
    today: boolean
    disabled: boolean
  }): unknown
  footer(props: { clear: () => void; today: () => void }): unknown
}>()

const open = ref(false)
const gridRef = useTemplateRef<HTMLElement>('grid')
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
const activeLocale = computed(() => locale || globalThis.navigator?.language || 'en')
const todayIso = toIso(new Date())
const visible = ref(initialVisible())
const days = computed(() => calendarDays(visible.value.year, visible.value.month, weekStartsOn))
const labels = computed(() => weekdayLabels(activeLocale.value, weekStartsOn))
const heading = computed(() =>
  monthLabel(activeLocale.value, visible.value.year, visible.value.month),
)
const selectedLabel = computed(() => {
  const format = (iso: string): string => {
    const date = parseIso(iso)
    if (!date) return iso
    return new Intl.DateTimeFormat(activeLocale.value, { dateStyle: 'medium' }).format(date)
  }
  const value = state.value.value
  if (isDateRange(value)) {
    if (value.start && value.end) return `${format(value.start)} – ${format(value.end)}`
    if (value.start) return format(value.start)
    return placeholder
  }
  return typeof value === 'string' ? format(value) : placeholder
})

const rangeValue = computed((): UiDateRange =>
  isDateRange(state.value.value) ? state.value.value : { start: null, end: null },
)

function initialValue(): UiDateValue {
  if (!range) return typeof defaultValue === 'string' ? defaultValue : null
  if (isDateRange(defaultValue)) return defaultValue
  if (typeof defaultValue === 'string') return { start: defaultValue, end: null }
  return { start: null, end: null }
}

function activeIso(): string | null {
  const value = state.value.value
  if (typeof value === 'string') return value
  if (isDateRange(value)) return value.start ?? value.end
  return null
}

function initialVisible(): { year: number; month: number } {
  const parsed = activeIso() ? parseIso(activeIso() ?? '') : null
  const date = parsed ?? new Date()
  return { year: date.getFullYear(), month: date.getMonth() }
}

function isSelected(iso: string): boolean {
  const value = state.value.value
  if (typeof value === 'string') return value === iso
  if (!isDateRange(value)) return false
  return value.start === iso || value.end === iso
}

function isInside(iso: string): boolean {
  const { start, end } = rangeValue.value
  if (!start || !end) return false
  return iso > start && iso < end
}

function blocked(iso: string): boolean {
  if (min && iso < min) return true
  if (max && iso > max) return true
  return false
}

function choose(day: CalendarDay): void {
  if (field.isDisabled.value || blocked(day.iso)) return
  if (!range) {
    state.setValue(day.iso)
    open.value = false
    return
  }
  const current = rangeValue.value
  if (!current.start || current.end) {
    state.setValue({ start: day.iso, end: null })
    return
  }
  const start = day.iso < current.start ? day.iso : current.start
  const end = day.iso < current.start ? current.start : day.iso
  state.setValue({ start, end })
  open.value = false
}

function clearValue(): void {
  state.setValue(range ? { start: null, end: null } : null)
  open.value = false
}

function chooseToday(): void {
  if (blocked(todayIso)) return
  choose({ iso: todayIso, outside: false, day: new Date().getDate() })
}

function previous(): void {
  visible.value = shiftMonth(visible.value.year, visible.value.month, -1)
}

function next(): void {
  visible.value = shiftMonth(visible.value.year, visible.value.month, 1)
}

function onGridKeydown(event: KeyboardEvent): void {
  const step =
    event.key === Key.ArrowLeft
      ? -1
      : event.key === Key.ArrowRight
        ? 1
        : event.key === Key.ArrowUp
          ? -7
          : event.key === Key.ArrowDown
            ? 7
            : 0
  if (step === 0) return
  const target = event.target
  if (!(target instanceof HTMLButtonElement)) return
  const iso = target.dataset.iso
  if (!iso) return
  const date = parseIso(iso)
  if (!date) return
  event.preventDefault()
  date.setDate(date.getDate() + step)
  visible.value = { year: date.getFullYear(), month: date.getMonth() }
  const nextIso = toIso(date)
  const escaped = globalThis.CSS?.escape(nextIso) ?? nextIso
  void Promise.resolve().then(() => {
    const button = gridRef.value?.querySelector<HTMLButtonElement>(`[data-iso="${escaped}"]`)
    button?.focus()
  })
}

watch(activeIso, (value) => {
  const date = value ? parseIso(value) : null
  if (!date) return
  visible.value = { year: date.getFullYear(), month: date.getMonth() }
})
</script>

<template>
  <div class="ui-date">
    <ui-popover v-model:open="open" :padded="false">
      <template #trigger="{ open: isOpen, toggle }">
        <slot name="trigger" :open="isOpen" :label="selectedLabel" :toggle="toggle">
          <button
            :id="field.controlId.value"
            class="ui-date__button"
            type="button"
            :aria-expanded="isOpen"
            :aria-invalid="field.isInvalid.value || undefined"
            :disabled="field.isDisabled.value || undefined"
          >
            {{ selectedLabel }}
          </button>
        </slot>
      </template>
      <div class="ui-date__panel">
        <slot name="header" :label="heading" :previous="previous" :next="next">
          <div class="ui-date__header">
            <button type="button" aria-label="Previous month" @click="previous">‹</button>
            <strong>{{ heading }}</strong>
            <button type="button" aria-label="Next month" @click="next">›</button>
          </div>
        </slot>
        <div
          ref="grid"
          class="ui-date__grid"
          role="grid"
          :aria-label="heading"
          @keydown="onGridKeydown"
        >
          <span
            v-for="(label, index) in labels"
            :key="`${weekStartsOn}-${index}`"
            class="ui-date__weekday"
            >{{ label }}</span
          >
          <button
            v-for="day in days"
            :key="day.iso"
            type="button"
            role="gridcell"
            :data-iso="day.iso"
            :data-outside="day.outside || undefined"
            :data-selected="isSelected(day.iso) || undefined"
            :data-in-range="isInside(day.iso) || undefined"
            :data-range-start="rangeValue.start === day.iso || undefined"
            :data-range-end="rangeValue.end === day.iso || undefined"
            :data-today="day.iso === todayIso || undefined"
            :disabled="blocked(day.iso) || undefined"
            :aria-selected="isSelected(day.iso)"
            :aria-current="day.iso === todayIso ? 'date' : undefined"
            @click="choose(day)"
          >
            <slot
              name="day"
              :day="day"
              :selected="isSelected(day.iso)"
              :in-range="isInside(day.iso)"
              :today="day.iso === todayIso"
              :disabled="blocked(day.iso)"
            >
              {{ day.day }}
            </slot>
          </button>
        </div>
        <slot name="footer" :clear="clearValue" :today="chooseToday">
          <div class="ui-date__footer">
            <button type="button" @click="clearValue">Clear</button>
            <button type="button" :disabled="blocked(todayIso) || undefined" @click="chooseToday">
              Today
            </button>
          </div>
        </slot>
      </div>
    </ui-popover>
    <input
      v-if="name && !range"
      type="hidden"
      :name="name"
      :value="typeof state.value.value === 'string' ? state.value.value : ''"
    />
    <template v-else-if="name">
      <input type="hidden" :name="`${name}Start`" :value="rangeValue.start ?? ''" />
      <input type="hidden" :name="`${name}End`" :value="rangeValue.end ?? ''" />
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-date {
  width: 100%;
}

.ui-date__button {
  @include control-field;
  text-align: start;
  cursor: pointer;
}

.ui-date__panel {
  width: 18rem;
  padding: var(--ui-space-3);
}

.ui-date__header,
.ui-date__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
}

.ui-date__header strong {
  font-size: var(--ui-font-size-sm);
  font-weight: 650;
}

.ui-date__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-top: var(--ui-space-3);
}

.ui-date__weekday {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  text-align: center;
}

button[role='gridcell'],
.ui-date__header button,
.ui-date__footer button {
  border: 0;
  background: transparent;
  color: var(--ui-color-fg);
  cursor: pointer;
}

button[role='gridcell'] {
  height: 2rem;
  border-radius: var(--ui-radius-sm);
  font-size: var(--ui-font-size-sm);
  font-variant-numeric: tabular-nums;

  &[data-outside] {
    color: var(--ui-color-muted);
  }

  &[data-today] {
    box-shadow: inset 0 0 0 1px var(--ui-color-accent);
  }

  &[data-in-range] {
    border-radius: 0;
    background: var(--ui-color-accent-subtle);
  }

  &[data-range-start] {
    border-start-start-radius: var(--ui-radius-sm);
    border-end-start-radius: var(--ui-radius-sm);
  }

  &[data-range-end] {
    border-start-end-radius: var(--ui-radius-sm);
    border-end-end-radius: var(--ui-radius-sm);
  }

  &[data-selected] {
    background: var(--ui-date-day-selected-bg, var(--ui-color-accent));
    color: var(--ui-date-day-selected-fg, var(--ui-color-accent-fg));
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 1px;
  }
}

.ui-date__footer {
  margin-top: var(--ui-space-3);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}
</style>
