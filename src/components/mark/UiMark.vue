<script setup lang="ts">
import type { UiTone } from '@/types/common'

const { tone = 'accent' } = defineProps<{
  tone?: UiTone
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <mark class="ui-mark" :data-tone="tone"><slot /></mark>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-mark {
  padding-inline: 0.2em;
  border-radius: var(--ui-radius-sm);
  color: inherit;

  @include tone-surface;
}
</style>
