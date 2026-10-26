<script setup lang="ts">
const { label, maxHeight = '16rem' } = defineProps<{
  label: string
  maxHeight?: string
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <div class="ui-scroll-area" role="region" :aria-label="label" tabindex="0" :style="{ maxHeight }">
    <slot />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-scroll-area {
  @include surface;
  overflow: auto;
  padding: var(--ui-space-3);
  font-size: var(--ui-font-size-sm);

  @include focus-ring(2px);
}
</style>
