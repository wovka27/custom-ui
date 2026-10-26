<script setup lang="ts">
import { computed } from 'vue'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'
import { nextCycle, type UiCycleState } from './cycle'

const {
  modelValue,
  defaultValue,
  states,
  label = 'State',
} = defineProps<{
  modelValue?: string
  defaultValue?: string
  states: readonly UiCycleState[]
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

defineSlots<{
  default(props: { state: UiCycleState; index: number }): unknown
}>()

const passed = useModelWasPassed()
const state = useControllable({
  value: () => (passed() ? modelValue : undefined),
  defaultValue: () => defaultValue ?? states[0]?.id ?? '',
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})
const current = computed(
  () => states.find((item) => item.id === state.value.value) ?? states[0],
)
const index = computed(() => states.findIndex((item) => item.id === current.value?.id))

function move(direction: 1 | -1): void {
  state.setValue(nextCycle(states, state.value.value, direction))
}
</script>

<template>
  <div class="ui-cycle" role="group" :aria-label="label">
    <button type="button" aria-label="Previous state" @click="move(-1)">‹</button>
    <button type="button" class="ui-cycle__current" :aria-label="`Next state, current ${current?.label ?? ''}`" @click="move(1)">
      <slot v-if="current" :state="current" :index="index">{{ current.label }}</slot>
    </button>
    <span class="ui-cycle__count">{{ index + 1 }}/{{ states.length }}</span>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-cycle {
  @include surface;
  display: inline-flex;
  align-items: center;
  height: var(--ui-control-height-sm);
  overflow: hidden;
}

button,
.ui-cycle__count {
  height: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: var(--ui-font-size-sm);
}

button {
  cursor: pointer;

  @include focus-ring(1px);
}

.ui-cycle__current {
  min-width: 5rem;
  padding-inline: var(--ui-space-3);
  font-weight: 650;
}

.ui-cycle__count {
  padding-inline: var(--ui-space-2);
  color: var(--ui-color-muted);
  font-variant-numeric: tabular-nums;
  font-size: var(--ui-font-size-xs);
}
</style>
