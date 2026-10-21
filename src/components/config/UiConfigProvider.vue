<script setup lang="ts">
import type { UiTheme } from '@/types/common'

const { theme = 'system', locale } = defineProps<{
  theme?: UiTheme
  locale?: string
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <div class="ui-config" :data-theme="theme === 'system' ? undefined : theme" :lang="locale">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-config {
  min-height: 100%;
}
</style>
