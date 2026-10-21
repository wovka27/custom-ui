<script setup lang="ts">
const { label = 'Loading', decorative = false } = defineProps<{
  label?: string
  decorative?: boolean
}>()
</script>

<template>
  <span
    class="ui-spinner"
    :role="decorative ? undefined : 'status'"
    :aria-label="decorative ? undefined : label"
    :aria-hidden="decorative || undefined"
  >
    <span class="ui-spinner__glyph" />
  </span>
</template>

<style scoped lang="scss">
.ui-spinner {
  display: inline-grid;
  place-items: center;
  width: 1.25rem;
  height: 1.25rem;
  color: currentColor;
}

.ui-spinner__glyph {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-inline-end-color: transparent;
  border-radius: var(--ui-radius-full);
  animation: ui-spin 0.7s linear infinite;
}

@keyframes ui-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
