<script setup lang="ts">
const { text } = defineProps<{
  text: string
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <div class="ui-watermark">
    <slot />
    <div class="ui-watermark__mark" aria-hidden="true">
      <span v-for="mark in 8" :key="mark">{{ text }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ui-watermark {
  position: relative;
  isolation: isolate;
  min-width: 0;
}

.ui-watermark__mark {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-content: space-evenly;
  justify-items: center;
  overflow: hidden;
  color: var(--ui-color-fg);
  font-size: var(--ui-font-size-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.12;
  pointer-events: none;
  user-select: none;
  transform: rotate(-18deg);
}
</style>
