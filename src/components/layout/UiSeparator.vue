<script setup lang="ts">
const { orientation = 'horizontal' } = defineProps<{
  orientation?: 'horizontal' | 'vertical'
}>()
</script>

<template>
  <hr v-if="orientation === 'horizontal'" class="ui-separator" />
  <div v-else class="ui-separator" role="separator" aria-orientation="vertical" />
</template>

<style scoped lang="scss">
.ui-separator {
  align-self: stretch;
  border: 0;
  background: var(--ui-color-border);
}

hr.ui-separator {
  width: 100%;
  height: 1px;
  margin: 0;
}

div.ui-separator {
  width: 1px;
  min-height: 1.25rem;
}
</style>
