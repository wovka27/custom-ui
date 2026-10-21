<script setup lang="ts" generic="T extends string | number">
import { useId } from 'vue'
import type { UiOption } from '@/types/common'
import { useControllable } from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'

const {
  legend,
  options,
  modelValue,
  defaultValue,
  name,
  disabled,
  invalid,
  required,
  hideLegend = false,
} = defineProps<{
  legend: string
  options: readonly UiOption<T>[]
  modelValue?: T
  defaultValue?: T
  name?: string
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  hideLegend?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: T]
  change: [value: T]
}>()

const autoName = useId()
const field = useFieldControl({
  id: () => undefined,
  invalid: () => invalid,
  disabled: () => disabled,
  required: () => required,
})
const state = useControllable<T | undefined>({
  value: () => modelValue,
  defaultValue: () => defaultValue,
  onChange: (next) => {
    if (next === undefined) return
    emit('update:modelValue', next)
    emit('change', next)
  },
})

function choose(option: UiOption<T>): void {
  if (option.disabled || field.isDisabled.value) return
  state.setValue(option.value)
}
</script>

<template>
  <fieldset
    class="ui-radio-group"
    :disabled="field.isDisabled.value || undefined"
    :aria-invalid="field.isInvalid.value || undefined"
    :aria-describedby="field.describedBy.value"
    :aria-required="field.isRequired.value || undefined"
  >
    <legend :class="{ 'ui-sr-only': hideLegend }">{{ legend }}</legend>
    <label v-for="option in options" :key="String(option.value)" class="ui-radio">
      <input
        class="ui-radio__input"
        type="radio"
        :name="name ?? autoName"
        :value="String(option.value)"
        :checked="state.value.value === option.value"
        :disabled="option.disabled || undefined"
        :required="field.isRequired.value || undefined"
        @change="choose(option)"
      />
      <span class="ui-radio__mark" aria-hidden="true" />
      <span class="ui-radio__copy">
        <span>{{ option.label }}</span>
        <small v-if="option.hint">{{ option.hint }}</small>
      </span>
    </label>
  </fieldset>
</template>

<style scoped lang="scss">
.ui-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--ui-space-2);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;

  legend {
    margin-bottom: var(--ui-space-1);
    padding: 0;
    color: var(--ui-color-fg);
    font-size: var(--ui-font-size-sm);
    font-weight: 650;
  }

  &:disabled {
    opacity: 0.6;
  }
}

.ui-radio {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-2);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
  cursor: pointer;
}

.ui-radio__input {
  position: absolute;
  opacity: 0;
  width: 1.125rem;
  height: 1.125rem;

  &:focus-visible + .ui-radio__mark {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }

  &:checked + .ui-radio__mark {
    border-color: var(--ui-choice-border-checked, var(--ui-color-accent));
  }

  &:active:not(:disabled) + .ui-radio__mark {
    transform: scale(var(--ui-press-scale));
  }

  &:checked + .ui-radio__mark::after {
    transform: scale(1);
  }
}

.ui-radio__mark {
  display: grid;
  place-items: center;
  width: 1.125rem;
  height: 1.125rem;
  margin-top: 0.15rem;
  border: 1px solid var(--ui-color-border-strong);
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-surface);
  flex: none;
  transition:
    border-color var(--ui-duration) var(--ui-ease),
    transform var(--ui-duration-press) var(--ui-ease);

  &::after {
    content: '';
    width: 0.5rem;
    height: 0.5rem;
    border-radius: var(--ui-radius-full);
    background: var(--ui-color-accent);
    transform: scale(0);
    transition: transform var(--ui-duration) var(--ui-ease);
  }
}

.ui-radio__copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.4;

  small {
    color: var(--ui-color-muted);
    font-size: var(--ui-font-size-xs);
  }
}
</style>
