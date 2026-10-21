<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, useTemplateRef } from 'vue'
import type { UiSize } from '@/types/common'
import { useControllable } from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'
import { className, cn } from '@/lib/cn'
import {
  currencyFractionDigits,
  cursorFromCount,
  formatAffix,
  formatInput,
  resolveLocale,
  significantCount,
} from './format'
import type { UiInputFormat, UiInputFormatContext, UiInputType } from './input.types'

defineOptions({ inheritAttrs: false })

const {
  modelValue,
  defaultValue = '',
  type = 'text',
  format,
  locale,
  currency = 'USD',
  fractionDigits,
  size = 'md',
  id,
  name,
  disabled,
  invalid,
  required,
  readonly = false,
  placeholder,
  autocomplete,
  inputmode,
  revealable = true,
  clearable = true,
} = defineProps<{
  modelValue?: string
  defaultValue?: string
  type?: UiInputType
  format?: UiInputFormat
  locale?: string
  currency?: string
  fractionDigits?: number
  size?: UiSize
  id?: string
  name?: string
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  readonly?: boolean
  placeholder?: string
  autocomplete?: string
  inputmode?: 'text' | 'email' | 'tel' | 'url' | 'numeric' | 'decimal' | 'search' | 'none'
  revealable?: boolean
  clearable?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const attrs = useAttrs()
const revealed = ref(false)
const inputRef = useTemplateRef<HTMLInputElement>('control')
const field = useFieldControl({
  id: () => id,
  invalid: () => invalid,
  disabled: () => disabled,
  required: () => required,
})
const state = useControllable({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})

const formatContext = computed<UiInputFormatContext>(() => {
  const resolved = resolveLocale(locale)
  return {
    locale: resolved,
    currency,
    fractionDigits:
      fractionDigits ?? (format === 'currency' ? currencyFractionDigits(resolved, currency) : 2),
  }
})
const adornment = computed(() =>
  format ? formatAffix(format, formatContext.value) : { prefix: '', suffix: '' },
)
const shown = computed(() =>
  format
    ? formatInput(format, state.value.value, formatContext.value, 'model').display
    : state.value.value,
)
const resolvedType = computed(() => {
  if (format === 'phone') return 'tel'
  if (format) return 'text'
  if (type === 'password' && revealed.value) return 'text'
  return type
})
const resolvedInputMode = computed(() => {
  if (inputmode) return inputmode
  if (format === 'phone') return 'tel'
  if (format === 'date' || format === 'time' || format === 'credit-card' || format === 'integer') {
    return 'numeric'
  }
  if (format === 'currency' || format === 'decimal' || format === 'percent') return 'decimal'
  return undefined
})
const resolvedAutocomplete = computed(() => {
  if (autocomplete) return autocomplete
  if (format === 'phone') return 'tel'
  if (format === 'credit-card') return 'cc-number'
  if (format === 'postal') return 'postal-code'
  return undefined
})
const showReveal = computed(() => !format && type === 'password' && revealable)
const showClear = computed(
  () =>
    !format &&
    clearable &&
    type === 'search' &&
    state.value.value.length > 0 &&
    !field.isDisabled.value,
)
const endSlot = computed(() => {
  if (showReveal.value || showClear.value) return 'button'
  if (adornment.value.suffix) return 'mark'
  return undefined
})

function restoreCaret(position: number): void {
  void nextTick(() => {
    const element = inputRef.value
    if (!element || document.activeElement !== element) return
    element.setSelectionRange(position, position)
  })
}

function onInput(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  if (!format) {
    state.setValue(target.value)
    return
  }
  const count = significantCount(format, target.value, target.selectionStart ?? target.value.length)
  const next = formatInput(format, target.value, formatContext.value, 'edit')
  state.setValue(next.value)
  target.value = next.display
  const position = cursorFromCount(format, next.display, count)
  target.setSelectionRange(position, position)
  restoreCaret(position)
}

function commit(origin: 'edit' | 'model', finalize: boolean): void {
  if (!format) return
  const next = formatInput(format, state.value.value, formatContext.value, origin, finalize)
  state.setValue(next.value)
}

function onChange(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  if (format) commit('model', format === 'currency')
  else state.setValue(target.value)
  emit('change', state.value.value)
}

function onBlur(event: FocusEvent): void {
  if (format === 'currency') commit('model', true)
  emit('blur', event)
}

function clearValue(): void {
  state.setValue('')
  emit('change', '')
}
</script>

<template>
  <div
    class="ui-input"
    :data-size="size"
    :data-prefix="adornment.prefix ? true : undefined"
    :data-end="endSlot"
  >
    <span v-if="adornment.prefix" class="ui-input__mark" data-side="start" aria-hidden="true">
      {{ adornment.prefix }}
    </span>
    <input
      v-bind="attrs"
      :id="field.controlId.value"
      ref="control"
      :class="cn('ui-input__control', className(attrs.class))"
      :type="resolvedType"
      :name="name"
      :value="shown"
      :placeholder="placeholder"
      :autocomplete="resolvedAutocomplete"
      :inputmode="resolvedInputMode"
      :spellcheck="format ? false : undefined"
      :readonly="readonly || undefined"
      :disabled="field.isDisabled.value || undefined"
      :required="field.isRequired.value || undefined"
      :aria-invalid="field.isInvalid.value || undefined"
      :aria-describedby="field.describedBy.value"
      :aria-errormessage="field.errorId.value"
      :aria-required="field.isRequired.value || undefined"
      @input="onInput"
      @change="onChange"
      @blur="onBlur"
      @focus="emit('focus', $event)"
    />
    <span v-if="adornment.suffix" class="ui-input__mark" data-side="end" aria-hidden="true">
      {{ adornment.suffix }}
    </span>
    <button
      v-if="showClear"
      class="ui-input__affix"
      type="button"
      aria-label="Clear search"
      @click="clearValue"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M4 4l8 8M12 4l-8 8"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
        />
      </svg>
    </button>
    <button
      v-if="showReveal"
      class="ui-input__affix"
      type="button"
      :aria-pressed="revealed"
      :aria-label="revealed ? 'Hide password' : 'Show password'"
      :disabled="field.isDisabled.value || undefined"
      @click="revealed = !revealed"
    >
      <svg v-if="revealed" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M2 2l12 12M6.2 6.4A2.4 2.4 0 0 0 9.6 9.8M3.2 5.2C2.2 6.1 1.5 7.2 1.2 8c.8 2.2 3.4 4.5 6.8 4.5.9 0 1.8-.2 2.5-.5M6.4 3.7A7 7 0 0 1 8 3.5c3.4 0 6 2.3 6.8 4.5-.3.7-.8 1.4-1.4 2"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
        />
      </svg>
      <svg v-else viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M1.2 8c.8-2.2 3.4-4.5 6.8-4.5S14 5.8 14.8 8c-.8 2.2-3.4 4.5-6.8 4.5S2 10.2 1.2 8Z"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
        />
        <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" stroke-width="1.4" />
      </svg>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-input {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;

  @include control-sizes;
}

.ui-input__control {
  @include control-field;
  font-variant-numeric: tabular-nums;

  /* Chromium paints its own clear control on type=search. The kit button is the only one. */
  &[type='search']::-webkit-search-decoration,
  &[type='search']::-webkit-search-cancel-button,
  &[type='search']::-webkit-search-results-button,
  &[type='search']::-webkit-search-results-decoration {
    display: none;
    appearance: none;
    -webkit-appearance: none;
  }
}

.ui-input[data-prefix='true'] .ui-input__control {
  padding-inline-start: 2.4rem;
}

.ui-input[data-end='button'] .ui-input__control {
  padding-inline-end: calc(var(--ui-space-3) + 1.75rem);
}

.ui-input[data-end='mark'] .ui-input__control {
  padding-inline-end: 2.6rem;
}

.ui-input__mark {
  position: absolute;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  font-variant-numeric: tabular-nums;
  pointer-events: none;

  &[data-side='start'] {
    inset-inline-start: 0.85rem;
  }

  &[data-side='end'] {
    inset-inline-end: 0.85rem;
  }
}

.ui-input__affix {
  position: absolute;
  inset-inline-end: var(--ui-space-1);
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
  color: var(--ui-color-muted);
  cursor: pointer;
  transition:
    background-color var(--ui-duration) var(--ui-ease),
    color var(--ui-duration) var(--ui-ease),
    transform var(--ui-duration-press) var(--ui-ease);

  @include focus-ring(1px);

  svg {
    width: 1rem;
    height: 1rem;
  }

  &:hover:not(:disabled) {
    color: var(--ui-color-fg);
    background: var(--ui-color-subtle);
  }

  &:active:not(:disabled) {
    transform: scale(var(--ui-press-scale));
  }
}
</style>
