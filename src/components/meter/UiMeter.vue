<script setup lang="ts">
import { computed } from 'vue'

const {
  value,
  min = 0,
  max = 100,
  low,
  high,
  optimum,
  label,
} = defineProps<{
  value: number
  min?: number
  max?: number
  low?: number
  high?: number
  optimum?: number
  label: string
}>()

const text = computed(() => `${value} of ${max}`)
</script>

<template>
  <label class="ui-meter">
    <span>{{ label }}</span>
    <meter :min="min" :max="max" :low="low" :high="high" :optimum="optimum" :value="value">
      {{ text }}
    </meter>
    <span class="ui-meter__value">{{ text }}</span>
  </label>
</template>

<style scoped lang="scss">
.ui-meter {
  display: grid;
  gap: var(--ui-space-1);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
}

meter {
  width: 100%;
  height: 0.5rem;
  accent-color: var(--ui-color-accent);
}

.ui-meter__value {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  font-variant-numeric: tabular-nums;
}
</style>
