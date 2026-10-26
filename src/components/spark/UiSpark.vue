<script setup lang="ts">
import { computed } from 'vue'
import { sparkPoints } from './points'

const { values, label } = defineProps<{
  values: readonly number[]
  label: string
}>()

const points = computed(() => sparkPoints(values, 80, 24))
const summary = computed(() => {
  if (values.length === 0) return `${label}, no values`
  const last = values[values.length - 1]
  return `${label}, last ${last}, low ${Math.min(...values)}, high ${Math.max(...values)}`
})
</script>

<template>
  <svg class="ui-spark" viewBox="0 0 80 24" role="img" :aria-label="summary">
    <polyline v-if="points" :points="points" />
  </svg>
</template>

<style scoped lang="scss">
.ui-spark {
  width: 5rem;
  height: 1.5rem;
  overflow: visible;
}

polyline {
  fill: none;
  stroke: var(--ui-color-accent);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
