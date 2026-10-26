<script setup lang="ts">
import { computed } from 'vue'

const {
  variant = 'text',
  width,
  height,
  lines = 1,
} = defineProps<{
  variant?: 'text' | 'block' | 'circle'
  width?: string
  height?: string
  lines?: number
}>()

const count = computed(() => (variant === 'text' ? Math.max(1, Math.floor(lines)) : 1))
const rows = computed(() => Array.from({ length: count.value }, (_, index) => index))
</script>

<template>
  <span class="ui-skeleton" :data-variant="variant" role="status" aria-label="Loading">
    <span v-for="row in rows" :key="row" class="ui-skeleton__bone" :style="{ width, height }" />
  </span>
</template>

<style scoped lang="scss">
.ui-skeleton {
  display: grid;
  gap: var(--ui-space-2);
  width: 100%;
}

.ui-skeleton__bone {
  display: block;
  width: 100%;
  height: 0.75rem;
  border-radius: var(--ui-radius-sm);
  background: linear-gradient(
    90deg,
    var(--ui-color-subtle) 25%,
    var(--ui-color-surface-raised) 50%,
    var(--ui-color-subtle) 75%
  );
  background-size: 200% 100%;
  animation: ui-skeleton 1.2s linear infinite;
}

.ui-skeleton[data-variant='block'] .ui-skeleton__bone {
  height: 6rem;
  border-radius: var(--ui-radius-md);
}

.ui-skeleton[data-variant='circle'] .ui-skeleton__bone {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--ui-radius-full);
}

@keyframes ui-skeleton {
  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-skeleton__bone {
    animation: none;
  }
}
</style>
