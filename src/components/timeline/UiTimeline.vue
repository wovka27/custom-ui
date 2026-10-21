<script setup lang="ts">
export interface UiTimelineItem {
  id: string
  title: string
  time?: string
  description?: string
}

const { items, label = 'Timeline' } = defineProps<{
  items: readonly UiTimelineItem[]
  label?: string
}>()

defineSlots<{
  item(props: { item: UiTimelineItem }): unknown
  marker(props: { item: UiTimelineItem }): unknown
}>()
</script>

<template>
  <ol class="ui-timeline" :aria-label="label">
    <li v-for="item in items" :key="item.id" class="ui-timeline__item">
      <span class="ui-timeline__mark">
        <slot name="marker" :item="item" />
      </span>
      <div class="ui-timeline__body">
        <slot name="item" :item="item">
          <time v-if="item.time" :datetime="item.time">{{ item.time }}</time>
          <strong>{{ item.title }}</strong>
          <p v-if="item.description">{{ item.description }}</p>
        </slot>
      </div>
    </li>
  </ol>
</template>

<style scoped lang="scss">
.ui-timeline {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ui-timeline__item {
  position: relative;
  display: grid;
  grid-template-columns: 1rem minmax(0, 1fr);
  column-gap: var(--ui-space-3);
  padding-bottom: var(--ui-space-4);
}

.ui-timeline__item::before {
  content: '';
  position: absolute;
  inset-inline-start: 0.45rem;
  top: 0.85rem;
  bottom: 0;
  width: 1px;
  background: var(--ui-color-border);
}

.ui-timeline__item:last-child {
  padding-bottom: 0;
}

.ui-timeline__item:last-child::before {
  display: none;
}

.ui-timeline__mark {
  z-index: 1;
  width: 0.55rem;
  height: 0.55rem;
  margin-top: 0.35rem;
  margin-inline-start: 0.2rem;
  border: 1px solid var(--ui-color-accent);
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-surface);
}

.ui-timeline__body {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

time {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  font-variant-numeric: tabular-nums;
}

strong {
  font-size: var(--ui-font-size-sm);
  font-weight: 650;
}

p {
  margin: 0;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  overflow-wrap: anywhere;
}
</style>
