<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@/composables/use-media-query'
import { provideScoreScheme } from '@/composables/use-score-scheme'
import { scoreVariables, type DesignScore } from '@/styles/score'
import type { UiTheme } from '@/types/common'

const {
  theme = 'system',
  locale,
  score,
} = defineProps<{
  theme?: UiTheme
  locale?: string
  score?: DesignScore
}>()

defineSlots<{
  default(): unknown
}>()

const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
const scheme = computed((): 'light' | 'dark' => {
  if (theme === 'dark') return 'dark'
  if (theme === 'light') return 'light'
  return prefersDark.value ? 'dark' : 'light'
})
provideScoreScheme(scheme)
const painted = computed(() =>
  score === undefined ? undefined : scoreVariables(score, scheme.value),
)
</script>

<template>
  <div
    class="ui-config"
    :data-theme="theme === 'system' ? undefined : theme"
    :lang="locale"
    :style="painted"
  >
    <slot />
  </div>
</template>

<style scoped lang="scss">
.ui-config {
  min-height: 100%;
}
</style>
