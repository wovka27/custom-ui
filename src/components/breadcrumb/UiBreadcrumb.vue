<script setup lang="ts">
import type { UiBreadcrumbItem } from './breadcrumb.types'

const { items, label = 'Breadcrumb' } = defineProps<{
  items: readonly UiBreadcrumbItem[]
  label?: string
}>()
</script>

<template>
  <nav class="ui-breadcrumb" :aria-label="label">
    <ol>
      <li v-for="(item, index) in items" :key="item.id">
        <a v-if="item.href && index < items.length - 1" :href="item.href">{{ item.label }}</a>
        <span v-else aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
}

.ui-breadcrumb li {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);

  &:not(:last-child)::after {
    content: '/';
    color: var(--ui-color-border-strong);
  }
}

.ui-breadcrumb a {
  color: var(--ui-color-muted);
  text-decoration: none;
  transition: color var(--ui-duration) var(--ui-ease);

  @include focus-ring(2px);

  &:hover {
    color: var(--ui-color-fg);
    text-decoration: underline;
    text-underline-offset: 0.18em;
  }
}

.ui-breadcrumb [aria-current='page'] {
  color: var(--ui-color-fg);
  font-weight: 650;
}
</style>
