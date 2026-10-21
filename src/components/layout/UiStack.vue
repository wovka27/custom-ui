<script setup lang="ts">
import type { UiAlign, UiGap } from '@/types/common'

const {
  as = 'div',
  gap = 'md',
  align = 'stretch',
} = defineProps<{
  as?: 'div' | 'section' | 'ul' | 'ol' | 'nav'
  gap?: UiGap
  align?: UiAlign
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <component :is="as" class="ui-stack" :data-gap="gap" :data-align="align">
    <slot />
  </component>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-stack {
  display: flex;
  flex-direction: column;
  align-items: var(--_align, stretch);
  justify-content: flex-start;
  gap: var(--_gap, var(--ui-space-4));
  min-width: 0;

  @include gap-scale;

  &[data-align='start'] {
    --_align: flex-start;
  }
  &[data-align='center'] {
    --_align: center;
  }
  &[data-align='end'] {
    --_align: flex-end;
  }
  &[data-align='stretch'] {
    --_align: stretch;
  }
}
</style>
