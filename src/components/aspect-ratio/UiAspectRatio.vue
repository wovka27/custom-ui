<script setup lang="ts">
const { ratio = '16 / 9' } = defineProps<{
  ratio?: string
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <div class="ui-aspect" :style="{ aspectRatio: ratio }">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-aspect {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--ui-radius-md);
  background: var(--ui-color-subtle);
}

.ui-aspect :deep(img),
.ui-aspect :deep(video) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
