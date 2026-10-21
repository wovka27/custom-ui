<script setup lang="ts">
defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <div class="sb-board">
    <slot />
  </div>
</template>

<style scoped>
.sb-board {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  width: 100%;
  max-width: 52rem;
  min-width: 0;
}
</style>
