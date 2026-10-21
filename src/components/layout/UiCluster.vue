<script setup lang="ts">
import type { UiGap, UiJustify } from '@/types/common'

const {
  as = 'div',
  gap = 'sm',
  justify = 'start',
} = defineProps<{
  as?: 'div' | 'section' | 'ul' | 'ol' | 'nav'
  gap?: UiGap
  justify?: UiJustify
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <component :is="as" class="ui-cluster" :data-gap="gap" :data-justify="justify">
    <slot />
  </component>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-cluster {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: var(--_justify, flex-start);
  gap: var(--_gap, var(--ui-space-2));
  min-width: 0;

  @include gap-scale;

  &[data-justify='start'] {
    --_justify: flex-start;
  }
  &[data-justify='center'] {
    --_justify: center;
  }
  &[data-justify='end'] {
    --_justify: flex-end;
  }
  &[data-justify='between'] {
    --_justify: space-between;
  }
}
</style>
