<script setup lang="ts">
defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <span class="ui-sr-only"><slot /></span>
</template>
