<script setup lang="ts">
import { computed } from 'vue'
import { useControllable, useModelWasPassed } from '@/composables/use-controllable'
import { maskSecret } from './mask'

const {
  modelValue,
  defaultValue = false,
  value,
  label,
} = defineProps<{
  modelValue?: boolean
  defaultValue?: boolean
  value: string
  label: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

defineSlots<{
  default(): unknown
}>()

const passed = useModelWasPassed()
const state = useControllable({
  value: () => (passed() ? modelValue : undefined),
  defaultValue: () => defaultValue,
  onChange: (next) => {
    emit('update:modelValue', next)
  },
})
const shown = computed(() => state.value.value)
const masked = computed(() => maskSecret(value))
</script>

<template>
  <span class="ui-redact">
    <span v-if="shown" class="ui-redact__value"
      ><slot>{{ value }}</slot></span
    >
    <span v-else class="ui-redact__value" aria-hidden="true">{{ masked }}</span>
    <button
      type="button"
      :aria-pressed="shown"
      :aria-label="shown ? `Hide ${label}` : `Show ${label}`"
      @click="state.setValue(!shown)"
    >
      {{ shown ? 'Hide' : 'Show' }}
    </button>
  </span>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-redact {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  font-family: var(--ui-font-mono);
}

button {
  @include focus-ring(2px);
  height: var(--ui-control-height-sm);
  padding-inline: var(--ui-space-2);
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-button-radius, var(--ui-radius-md));
  background: transparent;
  color: var(--ui-color-fg);
  font-family: var(--ui-font-sans);
  cursor: pointer;
}
</style>
