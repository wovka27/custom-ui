<script setup lang="ts">
import { computed, useId } from 'vue'
import type { UiSize } from '@/types/common'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'
import { useFieldControl } from '@/composables/use-field-control'

const {
  modelValue,
  defaultValue = false,
  size = 'md',
  id,
  disabled,
  invalid,
  required,
  label,
} = defineProps<{
  modelValue?: boolean
  defaultValue?: boolean
  size?: UiSize
  id?: string
  disabled?: boolean
  invalid?: boolean
  required?: boolean
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [checked: boolean]
  change: [checked: boolean]
}>()

defineSlots<{
  default(): unknown
}>()

const labelId = useId()
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
const checked = computed(() => state.value.value)

function toggle(): void {
  if (field.isDisabled.value) return
  state.setValue(!state.value.value)
}
</script>

<template>
  <button
    :id="field.controlId.value"
    class="ui-switch"
    type="button"
    role="switch"
    :data-state="checked ? 'on' : 'off'"
    :aria-checked="checked ? 'true' : 'false'"
    :aria-labelledby="labelId"
    :aria-invalid="field.isInvalid.value || undefined"
    :aria-describedby="field.describedBy.value"
    :aria-errormessage="field.errorId.value"
    :aria-required="field.isRequired.value || undefined"
    :disabled="field.isDisabled.value || undefined"
    :data-size="size"
    @click="toggle"
  >
    <span class="ui-switch__track" aria-hidden="true">
      <span class="ui-switch__thumb" />
    </span>
    <span :id="labelId" class="ui-switch__label"
      ><slot>{{ label }}</slot></span
    >
  </button>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-switch {
  --_track-w: 2.4rem;
  --_track-h: 1.35rem;
  --_thumb: 1rem;
  --_travel: calc(var(--_track-w) - var(--_thumb) - 4px);
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  max-width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
  text-align: start;
  cursor: pointer;

  &[data-size='sm'] {
    --_track-w: 2rem;
    --_track-h: 1.15rem;
    --_thumb: 0.85rem;
  }

  &[data-size='lg'] {
    --_track-w: 2.85rem;
    --_track-h: 1.6rem;
    --_thumb: 1.2rem;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &:focus-visible .ui-switch__track {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 2px;
  }

  &:active:not(:disabled) .ui-switch__track {
    transform: scale(var(--ui-press-scale));
  }

  &[data-state='on'] .ui-switch__track {
    background: var(--ui-switch-bg-checked, var(--ui-color-accent));
  }

  &[data-state='on'] .ui-switch__thumb {
    margin-inline-start: var(--_travel);
  }
}

.ui-switch__track {
  position: relative;
  width: var(--_track-w);
  height: var(--_track-h);
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-border-strong);
  flex: none;
  transition:
    background-color var(--ui-duration) var(--ui-ease),
    transform var(--ui-duration-press) var(--ui-ease);
}

.ui-switch__thumb {
  position: absolute;
  inset-block-start: 2px;
  inset-inline-start: 2px;
  width: var(--_thumb);
  height: var(--_thumb);
  margin-inline-start: 0;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-surface);
  transition:
    margin-inline-start var(--ui-duration) var(--ui-ease),
    background-color var(--ui-duration) var(--ui-ease);
}

.ui-switch__label {
  min-width: 0;
  line-height: 1.4;
}

@media (forced-colors: active) {
  .ui-switch__track,
  .ui-switch__thumb {
    border: 1px solid ButtonText;
  }
}
</style>
