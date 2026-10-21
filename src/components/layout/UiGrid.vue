<script setup lang="ts">
import type { UiGap } from '@/types/common'

const {
  as = 'div',
  gap = 'md',
  minColumn = '16rem',
} = defineProps<{
  as?: 'div' | 'section' | 'ul' | 'ol'
  gap?: UiGap
  minColumn?: string
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <component :is="as" class="ui-grid" :data-gap="gap" :style="{ '--ui-grid-min': minColumn }">
    <slot />
  </component>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--ui-grid-min, 16rem)), 1fr));
  gap: var(--_gap, var(--ui-space-4));
  width: 100%;
  max-width: 100%;
  min-width: 0;

  @include gap-scale;
}
</style>
