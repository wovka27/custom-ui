<script setup lang="ts">
import type { UiOption, UiSize } from '@/types/common'
import { Key } from '@/a11y/keys'
import { useControllable } from '@/composables/use-controllable'
import { nextEnabledIndex } from '@/lib/dom'

const {
  modelValue,
  defaultValue,
  options,
  size = 'md',
  disabled = false,
  label = 'Segmented choice',
} = defineProps<{
  modelValue?: string | number
  defaultValue?: string | number
  options: readonly UiOption<string | number>[]
  size?: UiSize
  disabled?: boolean
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

defineSlots<{
  option(props: { option: UiOption<string | number>; selected: boolean }): unknown
}>()

const state = useControllable<string | number | undefined>({
  value: () => modelValue,
  defaultValue: () => defaultValue ?? options[0]?.value,
  onChange: (next) => {
    if (next === undefined) return
    emit('update:modelValue', next)
    emit('change', next)
  },
})

function choose(option: UiOption<string | number> | undefined): void {
  if (!option || option.disabled || disabled) return
  state.setValue(option.value)
}

function onKeydown(event: KeyboardEvent): void {
  const step =
    event.key === Key.ArrowRight || event.key === Key.ArrowDown
      ? 1
      : event.key === Key.ArrowLeft || event.key === Key.ArrowUp
        ? -1
        : 0
  if (step === 0) return
  event.preventDefault()
  const current = options.findIndex((option) => option.value === state.value.value)
  const next = nextEnabledIndex(
    options.length,
    current + step,
    step,
    (index) => options[index]?.disabled === true,
  )
  const option = next >= 0 ? options[next] : undefined
  choose(option)
}
</script>

<template>
  <div
    class="ui-segmented"
    role="radiogroup"
    :aria-label="label"
    :data-size="size"
    :data-disabled="disabled || undefined"
    @keydown="onKeydown"
  >
    <button
      v-for="option in options"
      :key="String(option.value)"
      type="button"
      role="radio"
      :aria-checked="state.value.value === option.value"
      :disabled="disabled || option.disabled || undefined"
      :data-selected="state.value.value === option.value || undefined"
      @click="choose(option)"
    >
      <slot name="option" :option="option" :selected="state.value.value === option.value">
        {{ option.label }}
      </slot>
    </button>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-segmented {
  display: inline-flex;
  max-width: 100%;
  padding: 2px;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-subtle);

  @include control-sizes;
}

button {
  min-width: 0;
  height: calc(var(--_height, var(--ui-control-height-md)) - 6px);
  padding-inline: var(--ui-space-3);
  border: 0;
  border-radius: calc(var(--ui-radius-md) - 2px);
  background: transparent;
  color: var(--ui-color-muted);
  font: inherit;
  cursor: pointer;
  transition:
    background-color var(--ui-duration) var(--ui-ease),
    color var(--ui-duration) var(--ui-ease);

  &[data-selected] {
    background: var(--ui-color-surface);
    color: var(--ui-color-fg);
  }

  &:focus-visible {
    outline: 2px solid var(--ui-color-focus);
    outline-offset: 1px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}
</style>
