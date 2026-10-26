<script setup lang="ts">
import type { UiTone } from '@/types/common'

const { tone = 'neutral' } = defineProps<{
  tone?: UiTone
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <span class="ui-badge" :data-tone="tone"><slot /></span>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-badge {
  display: inline-flex;
  align-items: center;
  min-height: 1.4rem;
  padding-inline: var(--ui-space-2);
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-subtle);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-xs);
  font-weight: 650;
  line-height: 1;
  white-space: nowrap;

  @include tone-ink;
}
</style>
