<script setup lang="ts">
import { computed } from 'vue'
import { shares } from './shares'

const {
  start,
  end,
  startLabel,
  endLabel,
} = defineProps<{
  start: number
  end: number
  startLabel: string
  endLabel: string
}>()

const split = computed(() => shares(start, end))
const summary = computed(
  () => `${startLabel} ${Math.round(split.value.start)} percent, ${endLabel} ${Math.round(split.value.end)} percent`,
)
</script>

<template>
  <div class="ui-balance" role="img" :aria-label="summary">
    <div class="ui-balance__labels">
      <span>{{ startLabel }}</span>
      <span>{{ endLabel }}</span>
    </div>
    <div class="ui-balance__track">
      <span class="ui-balance__start" :style="{ width: `${split.start}%` }" />
      <span class="ui-balance__end" :style="{ width: `${split.end}%` }" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-balance {
  display: grid;
  gap: var(--ui-space-2);
  min-width: 12rem;
}

.ui-balance__labels,
.ui-balance__track {
  display: flex;
}

.ui-balance__labels {
  justify-content: space-between;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.ui-balance__track {
  height: 0.45rem;
  overflow: hidden;
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-subtle);
}

.ui-balance__start {
  background: var(--ui-color-accent);
}

.ui-balance__end {
  background: var(--ui-color-border-strong);
}
</style>
