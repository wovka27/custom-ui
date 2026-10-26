<script setup lang="ts">
import { computed } from 'vue'
import { nativeRole, nativeTag } from '@/lib/native-tag'

const { as = 'div', width = 'var(--ui-content-width)' } = defineProps<{
  as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'main' | 'search'
  width?: string
}>()

defineSlots<{
  default(): unknown
}>()
const tag = computed(() => nativeTag(as))
const role = computed(() => nativeRole(as))

</script>

<template>
  <component :is="tag" class="ui-container" :role="role" :style="{ '--ui-container-width': width }">
    <slot />
  </component>
</template>

<style scoped lang="scss">
.ui-container {
  width: min(100% - var(--ui-space-6), var(--ui-container-width, var(--ui-content-width)));
  margin-inline: auto;
}
</style>
