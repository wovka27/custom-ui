<script setup lang="ts">
export interface UiNavItem {
  id: string
  label: string
  href: string
  current?: boolean
}

const { items, label } = defineProps<{
  items: readonly UiNavItem[]
  label: string
}>()

defineSlots<{
  item(props: { item: UiNavItem }): unknown
}>()
</script>

<template>
  <nav class="ui-nav" :aria-label="label">
    <a
      v-for="item in items"
      :key="item.id"
      :href="item.href"
      :aria-current="item.current ? 'page' : undefined"
    >
      <slot name="item" :item="item">{{ item.label }}</slot>
    </a>
  </nav>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ui-space-1);
}

a {
  @include focus-ring(2px);
  padding: 0.35rem 0.6rem;
  border-radius: var(--ui-radius-sm);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-sm);
  text-decoration: none;

  &[aria-current='page'] {
    background: var(--ui-color-accent-subtle);
    color: var(--ui-color-accent);
  }
}
</style>
