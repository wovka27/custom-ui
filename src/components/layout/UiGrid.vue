<script setup lang="ts">
import { computed } from 'vue'
import { nativeRole, nativeTag } from '@/lib/native-tag'
import type { UiGap } from '@/types/common'

const {
  as = 'div',
  gap = 'md',
  minColumn = '16rem',
} = defineProps<{
  as?: 'div' | 'section' | 'article' | 'ul' | 'ol' | 'search'
  gap?: UiGap
  minColumn?: string
}>()

defineSlots<{
  default(): unknown
}>()
const tag = computed(() => nativeTag(as))
const role = computed(() => nativeRole(as))

</script>

<template>
  <component :is="tag" class="ui-grid" :role="role" :data-gap="gap" :style="{ '--ui-grid-min': minColumn }">
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
