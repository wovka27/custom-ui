<script setup lang="ts">
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'

const {
  modelValue,
  defaultValue = '',
  label,
  min,
  max,
  disabled = false,
} = defineProps<{
  modelValue?: string
  defaultValue?: string
  label: string
  min?: string
  max?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const passed = useModelWasPassed()
const state = useControllable({
  value: () => (passed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})

function onInput(event: Event): void {
  if (!(event.target instanceof HTMLInputElement)) return
  state.setValue(event.target.value)
}
</script>

<template>
  <input
    class="ui-time"
    type="time"
    :value="state.value.value"
    :aria-label="label"
    :min="min"
    :max="max"
    :disabled="disabled"
    @input="onInput"
  />
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-time {
  @include control-field;
  @include control-sizes;
  width: fit-content;
  font-variant-numeric: tabular-nums;
}
</style>
