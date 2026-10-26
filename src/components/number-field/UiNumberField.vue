<script setup lang="ts">
import { computed } from 'vue'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'
import { clampNumber, nextStep } from './step'

const {
  modelValue,
  defaultValue = 0,
  min,
  max,
  step = 1,
  disabled = false,
  label,
} = defineProps<{
  modelValue?: number | null
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

defineSlots<{
  prefix(): unknown
  suffix(): unknown
}>()

const passed = useModelWasPassed()
const state = useControllable<number | null>({
  value: () => (passed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})

const current = computed(() => state.value.value ?? Number.NaN)

function move(direction: 1 | -1): void {
  if (disabled) return
  state.setValue(nextStep(current.value, direction, step, min, max))
}

function onInput(event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return
  const raw = event.target.value
  if (raw.trim() === '') {
    state.setValue(null)
    return
  }
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return
  state.setValue(clampNumber(parsed, min, max))
}
</script>

<template>
  <div class="ui-number" :data-disabled="disabled ? 'true' : undefined">
    <span v-if="$slots.prefix" class="ui-number__affix"><slot name="prefix" /></span>
    <button type="button" aria-label="Decrease" :disabled="disabled" @click="move(-1)">−</button>
    <input
      :value="state.value.value ?? ''"
      type="text"
      inputmode="decimal"
      :aria-label="label"
      :disabled="disabled"
      @change="onInput"
      @keydown.up.prevent="move(1)"
      @keydown.down.prevent="move(-1)"
    />
    <button type="button" aria-label="Increase" :disabled="disabled" @click="move(1)">+</button>
    <span v-if="$slots.suffix" class="ui-number__affix"><slot name="suffix" /></span>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-number {
  @include control-field;
  display: flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding-inline: var(--ui-space-1);
  gap: var(--ui-space-1);

  &:focus-within {
    outline: 1px solid var(--ui-color-focus);
    outline-offset: 2px;
    border-color: var(--ui-control-border-focus, var(--ui-color-accent));
  }
}

input {
  width: 4.5rem;
  border: 0;
  background: transparent;
  color: inherit;
  font-variant-numeric: tabular-nums;
  text-align: center;

  &:focus {
    outline: none;
  }
}

button {
  @include icon-control(1.5rem);
  border-radius: var(--ui-radius-sm);
  font-size: var(--ui-font-size-md);
}

.ui-number__affix {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  padding-inline: var(--ui-space-1);
}
</style>
