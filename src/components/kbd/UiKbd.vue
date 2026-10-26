<script setup lang="ts">
defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <kbd class="ui-kbd"><slot /></kbd>
</template>

<style scoped lang="scss">
.ui-kbd {
  display: inline-flex;
  align-items: center;
  min-width: 1.35rem;
  height: 1.35rem;
  padding-inline: 0.35rem;
  border: 1px solid var(--ui-color-border-strong);
  border-bottom-width: 2px;
  border-radius: var(--ui-radius-sm);
  background: var(--ui-color-surface);
  color: var(--ui-color-fg);
  font-family: var(--ui-font-mono);
  font-size: 0.7rem;
  line-height: 1;
}
</style>
