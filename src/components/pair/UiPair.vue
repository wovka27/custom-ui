<script setup lang="ts">
import { computed } from 'vue'
import { UiNumberField } from '@/components/number-field'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'
import { orderPair, swapPair, type UiPairValue } from './pair'

const {
  modelValue,
  defaultValue = { start: 0, end: 10 },
  label,
  min,
  max,
  step = 1,
  ordered = true,
} = defineProps<{
  modelValue?: UiPairValue
  defaultValue?: UiPairValue
  label: string
  min?: number
  max?: number
  step?: number
  ordered?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UiPairValue]
}>()

const passed = useModelWasPassed()
const state = useControllable<UiPairValue>({
  value: () => (passed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})
const value = computed(() => state.value.value)

function write(start: number, end: number): void {
  state.setValue(ordered ? orderPair(start, end) : { start, end })
}
</script>

<template>
  <div class="ui-pair" role="group" :aria-label="label">
    <ui-number-field
      :model-value="value.start"
      label="Start"
      :min="min"
      :max="max"
      :step="step"
      @update:model-value="write($event ?? value.start, value.end)"
    />
    <button type="button" aria-label="Swap ends" @click="state.setValue(swapPair(value))">⇄</button>
    <ui-number-field
      :model-value="value.end"
      label="End"
      :min="min"
      :max="max"
      :step="step"
      @update:model-value="write(value.start, $event ?? value.end)"
    />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-pair {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
}

button {
  @include icon-control(2rem);
  @include surface;
  @include pressable;
  border-radius: var(--ui-radius-full);
}
</style>
