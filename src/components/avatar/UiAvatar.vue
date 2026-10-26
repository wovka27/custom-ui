<script setup lang="ts">
import type { UiSize } from '@/types/common'
import { initials } from './initials'

const {
  name,
  src,
  size = 'md',
  alt,
} = defineProps<{
  name: string
  src?: string
  size?: UiSize
  alt?: string
}>()

defineSlots<{
  default(): unknown
  badge(): unknown
}>()
</script>

<template>
  <span class="ui-avatar" :data-size="size">
    <img v-if="src" class="ui-avatar__image" :src="src" :alt="alt ?? name" />
    <span v-else class="ui-avatar__fallback">
      <slot>{{ initials(name) }}</slot>
    </span>
    <span v-if="$slots.badge" class="ui-avatar__badge"><slot name="badge" /></span>
  </span>
</template>

<style scoped lang="scss">
.ui-avatar {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  overflow: hidden;
  border: 1px solid var(--ui-color-border);
  border-radius: var(--ui-radius-full);
  background: var(--ui-color-subtle);
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-xs);
  font-weight: 650;
  line-height: 1;

  &[data-size='sm'] {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.65rem;
  }

  &[data-size='lg'] {
    width: 3.25rem;
    height: 3.25rem;
    font-size: var(--ui-font-size-sm);
  }
}

.ui-avatar__image,
.ui-avatar__fallback {
  width: 100%;
  height: 100%;
}

.ui-avatar__image {
  object-fit: cover;
}

.ui-avatar__fallback {
  display: grid;
  place-items: center;
}

.ui-avatar__badge {
  position: absolute;
  inset-inline-end: 0;
  inset-block-end: 0;
  display: grid;
}
</style>
