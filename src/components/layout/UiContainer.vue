<script setup lang="ts">
const { as = 'div', width = 'var(--ui-content-width)' } = defineProps<{
  as?: 'div' | 'section' | 'header' | 'footer' | 'main'
  width?: string
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <component :is="as" class="ui-container" :style="{ '--ui-container-width': width }">
    <slot />
  </component>
</template>

<style scoped lang="scss">
.ui-container {
  width: min(100% - var(--ui-space-6), var(--ui-container-width, var(--ui-content-width)));
  margin-inline: auto;
}
</style>
