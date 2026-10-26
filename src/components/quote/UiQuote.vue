<script setup lang="ts">
const { cite } = defineProps<{
  cite?: string
}>()

defineSlots<{
  default(): unknown
  footer(): unknown
}>()
</script>

<template>
  <figure class="ui-quote">
    <blockquote :cite="cite"><slot /></blockquote>
    <figcaption v-if="cite || $slots.footer"><slot name="footer">{{ cite }}</slot></figcaption>
  </figure>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-quote {
  margin: 0;
}

blockquote {
  @include surface;
  margin: 0;
  padding: var(--ui-space-4);
  border-inline-start: 3px solid var(--ui-color-accent);
  font-size: var(--ui-font-size-md);
}

figcaption {
  margin-top: var(--ui-space-2);
  color: var(--ui-color-muted);
  font-size: var(--ui-font-size-xs);
}
</style>
