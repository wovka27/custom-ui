<script setup lang="ts">
import type { UiTone } from '@/types/common'

const {
  label,
  tone = 'neutral',
  pulse = false,
} = defineProps<{
  label?: string
  tone?: UiTone
  pulse?: boolean
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <span class="ui-status" :data-tone="tone">
    <span class="ui-status__dot" :data-pulse="pulse ? 'true' : undefined" aria-hidden="true" />
    <span
      ><slot>{{ label }}</slot></span
    >
  </span>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-status {
  display: inline-flex;
  align-items: center;
  gap: var(--ui-space-2);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-sm);
}

.ui-status__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-muted);
}

.ui-status[data-tone='accent'] .ui-status__dot {
  background: var(--ui-color-accent);
  color: var(--ui-color-accent);
}
.ui-status[data-tone='success'] .ui-status__dot {
  background: var(--ui-color-success);
  color: var(--ui-color-success);
}
.ui-status[data-tone='warning'] .ui-status__dot {
  background: var(--ui-color-warning);
  color: var(--ui-color-warning);
}
.ui-status[data-tone='danger'] .ui-status__dot {
  background: var(--ui-color-danger);
  color: var(--ui-color-danger);
}
.ui-status[data-tone='info'] .ui-status__dot {
  background: var(--ui-color-info);
  color: var(--ui-color-info);
}

.ui-status__dot[data-pulse] {
  box-shadow: 0 0 0 0 currentColor;
  animation: ui-status-pulse 1.6s var(--ui-ease) infinite;
}

@keyframes ui-status-pulse {
  70% {
    box-shadow: 0 0 0 0.35rem transparent;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-status__dot[data-pulse] {
    animation: none;
  }
}
</style>
