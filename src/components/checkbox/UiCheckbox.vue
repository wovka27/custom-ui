<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'
import type { UiSize } from '@/types/common'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'

const {
  modelValue,
  defaultValue = false,
  size = 'md',
  id,
  name,
  value = 'on',
  disabled,
  invalid,
  required,
  indeterminate = false,
  hideLabel = false,
  label,
} = defineProps<{
  modelValue?: boolean
  defaultValue?: boolean
  size?: UiSize
  id?: string
  name?: string
  value?: string
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  indeterminate?: boolean
  hideLabel?: boolean
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [checked: boolean]
  change: [checked: boolean]
}>()

defineSlots<{
  default(): unknown
}>()

const inputRef = useTemplateRef<HTMLInputElement>('input')
const modelWasPassed = useModelWasPassed()
const field = useFieldControl({
  id: () => id,
  invalid: () => invalid,
  disabled: () => disabled,
  required: () => required,
})
const state = useControllable({
  value: () => (modelWasPassed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
    emit('change', next)
  },
})

watch(
  [inputRef, () => indeterminate],
  () => {
    const element = inputRef.value
    if (!element) return
    element.indeterminate = indeterminate
  },
  { flush: 'post' },
)

function onChange(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  state.setValue(target.checked)
}
</script>

<template>
  <label class="ui-checkbox" :data-size="size">
    <input
      :id="field.controlId.value"
      ref="input"
      class="ui-checkbox__input"
      type="checkbox"
      :name="name"
      :value="value"
      :checked="state.value.value"
      :disabled="field.isDisabled.value || undefined"
      :required="field.isRequired.value || undefined"
      :aria-invalid="field.isInvalid.value || undefined"
      :aria-describedby="field.describedBy.value"
      :aria-errormessage="field.errorId.value"
      @change="onChange"
    />
    <span class="ui-checkbox__box" aria-hidden="true" />
    <span class="ui-checkbox__label" :class="{ 'ui-sr-only': hideLabel }">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-checkbox {
  position: relative;
  display: inline-flex;
  align-items: flex-start;
  gap: var(--ui-space-2);
  max-width: 100%;
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
  cursor: pointer;
}

.ui-checkbox__input {
  position: absolute;
  width: 1.125rem;
  height: 1.125rem;
  margin: 0.15rem 0 0;
  opacity: 0;
  cursor: inherit;

  &:focus-visible + .ui-checkbox__box {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }

  &:checked + .ui-checkbox__box,
  &:indeterminate + .ui-checkbox__box {
    border-color: var(--ui-choice-border-checked, var(--ui-color-accent));
    background: var(--ui-choice-bg-checked, var(--ui-color-accent));
  }

  &:active:not(:disabled) + .ui-checkbox__box {
    transform: scale(var(--ui-press-scale));
  }

  &:checked + .ui-checkbox__box::after,
  &:indeterminate + .ui-checkbox__box::after {
    opacity: 1;
  }

  &:indeterminate + .ui-checkbox__box::after {
    width: 0.6rem;
    height: 0;
    border: 0;
    border-top: 2px solid var(--ui-color-accent-fg);
    transform: none;
  }

  &:disabled + .ui-checkbox__box {
    opacity: 0.55;
  }
}

.ui-checkbox__box {
  display: grid;
  place-items: center;
  width: 1.125rem;
  height: 1.125rem;
  margin-top: 0.15rem;
  border: 1px solid var(--ui-color-border-strong);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-surface);
  flex: none;
  transition:
    border-color var(--ui-duration) var(--ui-ease),
    background-color var(--ui-duration) var(--ui-ease),
    transform var(--ui-duration-press) var(--ui-ease);

  &::after {
    content: '';
    width: 0.6rem;
    height: 0.32rem;
    border-bottom: 2px solid var(--ui-color-accent-fg);
    border-inline-start: 2px solid var(--ui-color-accent-fg);
    opacity: 0;
    transform: rotate(-45deg) translateY(-1px);
    transition:
      opacity var(--ui-duration) var(--ui-ease),
      transform var(--ui-duration) var(--ui-ease);
  }
}

.ui-checkbox__label {
  min-width: 0;
  line-height: 1.4;
}

.ui-checkbox__input:disabled ~ .ui-checkbox__label {
  color: var(--ui-color-muted);
  cursor: not-allowed;
}
</style>
