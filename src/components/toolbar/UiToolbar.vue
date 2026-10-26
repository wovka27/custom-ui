<script setup lang="ts">
const { label } = defineProps<{
  label: string
}>()

defineSlots<{
  default(): unknown
  end(): unknown
}>()
</script>

<template>
  <div class="ui-toolbar" role="toolbar" :aria-label="label">
    <div class="ui-toolbar__start"><slot /></div>
    <div v-if="$slots.end" class="ui-toolbar__end"><slot name="end" /></div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as *;

.ui-toolbar {
  @include surface;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--ui-space-2);
  padding: var(--ui-space-2);
}

.ui-toolbar__start,
.ui-toolbar__end {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ui-space-2);
  min-width: 0;
}
</style>
