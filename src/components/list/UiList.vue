<script setup lang="ts">
const { items = [], ordered = false, label } = defineProps<{
  items?: readonly string[]
  ordered?: boolean
  label?: string
}>()

defineSlots<{
  default(): unknown
  item(props: { item: string; index: number }): unknown
}>()
</script>

<template>
  <component :is="ordered ? 'ol' : 'ul'" class="ui-list" :aria-label="label">
    <slot>
      <li v-for="(item, index) in items" :key="`${index}-${item}`">
        <slot name="item" :item="item" :index="index">{{ item }}</slot>
      </li>
    </slot>
  </component>
</template>

<style scoped lang="scss">
.ui-list {
  display: grid;
  gap: var(--ui-space-1);
  margin: 0;
  padding-inline-start: 1.1rem;
  font-size: var(--ui-font-size-sm);
}
</style>
