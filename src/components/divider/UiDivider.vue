<script setup lang="ts">
import { useSlots } from 'vue'

const { orientation = 'horizontal', label } = defineProps<{
  orientation?: 'horizontal' | 'vertical'
  label?: string
}>()

defineSlots<{
  default(): unknown
}>()

const slots = useSlots()
</script>

<template>
  <div
    class="ui-divider"
    role="separator"
    :aria-orientation="orientation"
    :data-orientation="orientation"
    :data-labeled="Boolean(label || slots.default) || undefined"
  >
    <span v-if="label || slots.default"
      ><slot>{{ label }}</slot></span
    >
  </div>
</template>

<style scoped lang="scss">
.ui-divider {
  display: flex;
  align-items: center;
  gap: var(--ui-space-3);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
  letter-spacing: 0.04em;

  &::before,
  &::after {
    content: '';
    flex: 1;
    background: var(--ui-color-border);
  }

  &[data-orientation='horizontal'] {
    width: 100%;

    &::before,
    &::after {
      height: 1px;
    }
  }

  &[data-orientation='vertical'] {
    flex-direction: column;
    align-self: stretch;
    min-height: 1.25rem;

    &::before,
    &::after {
      width: 1px;
    }
  }

  &:not([data-labeled])::after {
    display: none;
  }
}
</style>
