<script setup lang="ts">
import { computed } from 'vue'
import { nativeTag } from '@/lib/native-tag'

const {
  as = 'p',
  size = 'md',
  tone = 'default',
} = defineProps<{
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'small'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  tone?: 'default' | 'muted'
}>()

defineSlots<{
  default(): unknown
}>()

const tag = computed(() => nativeTag(as))
</script>

<template>
  <component :is="tag" class="ui-text" :data-size="size" :data-tone="tone">
    <slot />
  </component>
</template>

<style scoped lang="scss">
.ui-text {
  margin: 0;
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-md);
}

.ui-text[data-tone='muted'] {
  color: var(--ui-color-muted);
}

.ui-text[data-size='xs'] {
  font-size: var(--ui-font-size-xs);
}
.ui-text[data-size='sm'] {
  font-size: var(--ui-font-size-sm);
}
.ui-text[data-size='lg'] {
  font-size: var(--ui-font-size-lg);
}
.ui-text[data-size='xl'] {
  font-family: var(--ui-font-display);
  font-size: var(--ui-font-size-xl);
}
</style>
