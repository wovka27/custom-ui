<script setup lang="ts">
const { active = false, label = 'Scanning' } = defineProps<{
  active?: boolean
  label?: string
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <div class="ui-scan" :data-active="active ? 'true' : undefined" role="status" :aria-label="active ? label : undefined">
    <slot />
    <span v-if="active" class="ui-scan__line" aria-hidden="true" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-scan {
  @include surface;
  position: relative;
  overflow: hidden;
  padding: var(--ui-space-4);
}

.ui-scan__line {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 1px;
  background: var(--ui-color-accent);
  animation: ui-scan 1.6s var(--ui-ease) infinite;
}

@keyframes ui-scan {
  from {
    top: 0;
  }
  to {
    top: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ui-scan__line {
    top: 50%;
    animation: none;
  }
}
</style>
