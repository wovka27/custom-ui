<script setup lang="ts">
const { label } = defineProps<{
  label: string
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <form class="ui-search" role="search" :aria-label="label" @submit.prevent>
    <slot />
  </form>
</template>

<style scoped lang="scss">
.ui-search {
  min-width: 0;
}
</style>
