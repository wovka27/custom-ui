<script setup lang="ts">
import type { UiStepItem } from './steps'

const { items, current = 0 } = defineProps<{
  items: readonly UiStepItem[]
  current?: number
}>()

defineSlots<{
  item(props: { item: UiStepItem; index: number; state: 'done' | 'current' | 'upcoming' }): unknown
}>()

function stateOf(index: number): 'done' | 'current' | 'upcoming' {
  if (index < current) return 'done'
  if (index === current) return 'current'
  return 'upcoming'
}
</script>

<template>
  <ol class="ui-steps">
    <li
      v-for="(item, index) in items"
      :key="item.id"
      class="ui-steps__item"
      :data-state="stateOf(index)"
      :aria-current="index === current ? 'step' : undefined"
    >
      <slot name="item" :item="item" :index="index" :state="stateOf(index)">
        <span class="ui-steps__index">{{ index + 1 }}</span>
        <span class="ui-steps__copy">
          <span class="ui-steps__title">{{ item.title }}</span>
          <span v-if="item.description" class="ui-steps__description">{{ item.description }}</span>
        </span>
      </slot>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.ui-steps {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-steps__item {
  display: flex;
  align-items: flex-start;
  gap: var(--ui-space-2);
  min-width: 10rem;
  color: var(--ui-color-muted);
}

.ui-steps__index {
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-full);
  font-size: var(--ui-font-size-xs);
  font-variant-numeric: tabular-nums;
}

.ui-steps__item[data-state='current'] {
  color: var(--ui-color-fg);
}

.ui-steps__item[data-state='current'] .ui-steps__index,
.ui-steps__item[data-state='done'] .ui-steps__index {
  border-color: var(--ui-color-accent);
  background: var(--ui-color-accent);
  color: var(--ui-color-accent-fg);
}

.ui-steps__copy {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.ui-steps__title {
  font-size: var(--ui-font-size-sm);
  font-weight: 650;
}

.ui-steps__description {
  font-size: var(--ui-font-size-xs);
}
</style>
