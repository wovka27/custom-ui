import { computed, inject, provide, type ComputedRef, type InjectionKey } from 'vue'
import { useMediaQuery } from '@/composables/use-media-query'
import type { ScoreScheme } from '@/styles/score'

const scoreSchemeKey: InjectionKey<ComputedRef<ScoreScheme>> = Symbol('score-scheme')

export function provideScoreScheme(scheme: ComputedRef<ScoreScheme>): void {
  provide(scoreSchemeKey, scheme)
}

export function useScoreScheme(): ComputedRef<ScoreScheme> {
  const injected = inject(scoreSchemeKey, null)
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  return computed(() => {
    if (injected) return injected.value
    return prefersDark.value ? 'dark' : 'light'
  })
}
