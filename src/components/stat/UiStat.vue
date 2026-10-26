<script setup lang="ts">
import type { UiTone } from '@/types/common'

const {
  label,
  value,
  hint,
  tone = 'neutral',
} = defineProps<{
  label: string
  value: string
  hint?: string
  tone?: UiTone
}>()

defineSlots<{
  label(): unknown
  value(): unknown
  hint(): unknown
}>()
</script>

<template>
  <article class="ui-stat" :data-tone="tone">
    <p class="ui-stat__label">
      <slot name="label">{{ label }}</slot>
    </p>
    <p class="ui-stat__value">
      <slot name="value">{{ value }}</slot>
    </p>
    <p v-if="hint || $slots.hint" class="ui-stat__hint">
      <slot name="hint">{{ hint }}</slot>
    </p>
  </article>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-stat {
  @include surface;
  display: grid;
  gap: var(--ui-space-1);
  padding: var(--ui-space-4);
}

.ui-stat__label,
.ui-stat__value,
.ui-stat__hint {
  margin: 0;
}

.ui-stat__label,
.ui-stat__hint {
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}

.ui-stat__value {
  font-family: var(--ui-font-display);
  font-size: var(--ui-font-size-xl);
  font-variant-numeric: tabular-nums;
}

.ui-stat[data-tone='success'] .ui-stat__hint {
  color: var(--ui-color-success);
}
.ui-stat[data-tone='danger'] .ui-stat__hint {
  color: var(--ui-color-danger);
}
.ui-stat[data-tone='warning'] .ui-stat__hint {
  color: var(--ui-color-warning-fg);
}
.ui-stat[data-tone='accent'] .ui-stat__hint,
.ui-stat[data-tone='info'] .ui-stat__hint {
  color: var(--ui-color-accent);
}
</style>
