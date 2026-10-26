<script setup lang="ts">
import type { UiTone } from '@/types/common'

const { text, tone = 'accent' } = defineProps<{
  text: string
  tone?: UiTone
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <span class="ui-stamp" :data-tone="tone" role="img" :aria-label="text">
    <slot>{{ text }}</slot>
  </span>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-stamp {
  display: inline-grid;
  place-items: center;
  min-width: 5.5rem;
  min-height: 2.4rem;
  padding: 0.35rem 0.7rem;
  border: 1px solid currentColor;
  border-radius: var(--ui-radius-sm);
  color: var(--ui-color-accent);
  font-size: var(--ui-font-size-xs);
  font-weight: 650;
  letter-spacing: 0.14em;
  line-height: 1;
  text-transform: uppercase;
  transform: rotate(-8deg);

  @include tone-ink;
  background: transparent;
}
</style>
